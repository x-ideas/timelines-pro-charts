import { Notice, moment } from 'obsidian';
import type { DataviewApi } from 'obsidian-dataview';

interface IDailyCreateReport {
	/** 年
	 * @example 2023
	 */
	year?: string;
}

/**
 * 类似于github中的提交记录一样
 * @param {DataviewApi} dv
 * @param {HTMLElement} container
 * @param {IDailyCreateReport} opt 选项
 *
 * @example
 *
 * ```dataviewjs
 * 	const proChartsApi = dv.app.plugins.plugins['timelines-pro-charts'].api;
 * 	proChartsApi.dailyCreateReport(dv, this.container, {year: '2023'})
 * ```
 */
export function dailyCreateReport(
	dv: DataviewApi,
	container: HTMLElement,
	opt: IDailyCreateReport,
) {
	const year =
		opt.year ||
		// @ts-ignore
		moment().format('YYYY');

	const echartPlugin =
		// @ts-ignore
		app.plugins.plugins['echarts-light'];

	if (!echartPlugin) {
		new Notice('看起来echarts-light插件没有安装');
		return;
	}

	const echarts = echartPlugin.echarts();

	// year年的文档创建情况
	const yearDocCreateInfo: Record<string, { cday: string; count: number }> = dv
		.pages()
		.filter(p => {
			return echarts.format.formatTime('yyyy', p.file.ctime) === year;
		})
		.groupBy(p => {
			return p.file.cday.toFormat('yyyy-MM-dd');
		})
		.map(p => {
			return { cday: p.key, count: p.rows.length };
		})
		.array()
		.reduce<Record<string, { cday: string; count: number }>>((accu, curr) => {
			accu[curr.cday] = curr;
			return accu;
		}, {});

	function getVirtulData(year: string) {
		year = year || '2017';
		const date = +echarts.number.parseDate(year + '-01-01');
		const end = +echarts.number.parseDate(+year + 1 + '-01-01');
		const dayTime = 3600 * 24 * 1000;
		const data = [];
		for (let time = date; time < end; time += dayTime) {
			const day = echarts.format.formatTime('yyyy-MM-dd', time);
			data.push([day, yearDocCreateInfo[day]?.count || 0]);
		}
		return data;
	}

	const data = getVirtulData(year);
	const options = {
		width: 1200,
		height: 300,
		backgroundColor: '#404a59',
		title: {
			top: 30,
			left: 'center',
			text: 'Daily Step Count',
			textStyle: {
				color: '#fff',
			},
		},
		tooltip: {
			trigger: 'item',
		},
		legend: {
			top: '30',
			left: '100',
			data: ['Steps', 'Top 12'],
			textStyle: {
				color: '#fff',
			},
		},
		// visualMap: {
		// 	min: 0,
		// 	max: 100,
		// 	type: "piecewise",
		// 	orient: "horizontal",
		// 	left: "center",
		// 	top: 65,
		// },
		calendar: {
			top: 120,
			left: 30,
			right: 30,
			cellSize: ['auto', 13],
			range: year,
			itemStyle: {
				color: '#323c48',
				borderWidth: 1,
				borderColor: '#111',
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: '#000',
					width: 4,
					type: 'solid',
				},
			},
			yearLabel: { show: false },
		},
		series: [
			{
				coordinateSystem: 'calendar',
				data: data,
				name: 'Steps',
				type: 'scatter',
				symbolSize: function (val: any) {
					return getSize(val[1]);
				},
				itemStyle: {
					color: '#ddb926',
				},
			},
			{
				name: 'Top 12',
				type: 'effectScatter',
				coordinateSystem: 'calendar',
				data: data
					.sort(function (a, b) {
						return b[1] - a[1];
					})
					.slice(0, 12),
				symbolSize: function (val: any) {
					const value = val[1];
					return getSize(value);
				},
				showEffectOn: 'render',
				rippleEffect: {
					brushType: 'stroke',
				},
				itemStyle: {
					color: '#f4e925',
					shadowBlur: 10,
					shadowColor: '#333',
				},
				zlevel: 1,
			},
		],
	};

	echartPlugin['render'](options, container);
}

function getSize(val: number) {
	if (val <= 20) {
		return val;
	} else {
		return 10 + val / 10;
	}
}
