import { Notice } from 'obsidian';
import type { DataviewApi } from 'obsidian-dataview';
import type { ITimelineEventItemParsed } from '../../types';
import type { EChartsOption } from 'echarts';
import dayjs from 'dayjs';
import { TimeDurationUnit, TimeDurationValue } from '../../types';

interface IProjectProcessingReportOpt {
	/**
	 * 开始时间, format: 1982/04/23
	 */
	dateStart?: string;
	/**
	 * 结束时间，format: 1982/04/23
	 */
	dateEnd?: string;

	/**
	 * 是否显示debug信息
	 */
	debug?: boolean;
	/**
	 * 默认3
	 */
	headerLevel?: number;
	/**
	 * 事件的分组方式
	 */
	groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';

	/**
	 * 返回group的key，相同key的会被统一处理
	 * 返回值也会被当作x轴的标签
	 * key也有排序的功能
	 */
	// groupBy?: (item: ITimelineEventItemParsed) => string;
}

interface IGroupedProjectEvents {
	[projectTag: string]: ITimelineEventItemParsed[];
}

function groupByDay(event: ITimelineEventItemParsed): string {
	return dayjs(event.date || event.dateStart).format('YYYY/MM/DD');
}

function groupByWeek(event: ITimelineEventItemParsed): string {
	const date = dayjs(event.date || event.dateStart);
	const start = date.startOf('week').format('YYYY-MM-DD');
	const end = date.endOf('week').format('YYYY-MM-DD');

	return `${start}~${end}`;
}

function groupByMonth(event: ITimelineEventItemParsed): string {
	const date = dayjs(event.date || event.dateStart);
	const start = date.startOf('month');

	return `${start.format('YYYY-MM')}`;
}

function groupByQuarter(event: ITimelineEventItemParsed): string {
	const date = dayjs(event.date || event.dateStart);
	const start = date.startOf('quarter');

	return `第${start}季度`;
}

function groupByYear(event: ITimelineEventItemParsed): string {
	const date = dayjs(event.date || event.dateStart);

	return `${date.format('YYYY')}`;
}

function getGroupBy(
	type: IProjectProcessingReportOpt['groupBy'],
): (event: ITimelineEventItemParsed) => string {
	switch (type) {
		case 'day':
			return groupByDay;

		case 'week':
			return groupByWeek;

		case 'month':
			return groupByMonth;

		case 'quarter':
			return groupByQuarter;

		case 'year':
			return groupByYear;

		default:
			console.error('未知的groupBy类型', type);
			return () => 'unknown';
	}
}

export async function projectProcessingReportAll(
	dv: DataviewApi,
	container: HTMLElement,
	opt?: IProjectProcessingReportOpt,
) {
	const { debug = false, ...restParams } = opt || {};

	const timelinesProApi =
		// @ts-ignore
		dv.app.plugins.plugins['timelines-pro']?.api;

	if (!timelinesProApi) {
		new Notice('请先安装timelines-pro插件');
		console.error(
			'请先安装timelines-pro插件',
			// @ts-ignore
			dv.current(),
		);
		return;
	}

	const params = {
		eventTags: 'Projects',
		...restParams,
	};

	const res = await timelinesProApi.searchTimelineEvents(params);

	if (debug) {
		console.log('查找到的结果', res, '参数', params);
	}

	// 根据名字分组
	const groupedProjectEvents: IGroupedProjectEvents = {};
	// 类型查看timeline-pro的事件定义
	res.forEach((item: ITimelineEventItemParsed) => {
		const eventTags = item.parsedEventTags || [];
		const projectTags = eventTags.filter((tag: string) =>
			tag.startsWith('Project'),
		);
		for (const tag of projectTags) {
			const events = groupedProjectEvents[tag];
			if (events) {
				events.push(item);
			} else {
				groupedProjectEvents[tag] = [item];
			}
		}
	});

	if (debug) {
		console.log('分组后的结果', groupedProjectEvents);
	}

	Object.keys(groupedProjectEvents)
		.sort()
		.forEach(tag => {
			const events = groupedProjectEvents[tag];
			const divContainer = container.createDiv();
			container.appendChild(divContainer);

			projectProcessingReport(dv, divContainer, tag, events, opt);
		});
}

/**
 * 项目进度报告，总进度+跟上周的做一个对比
 * wallterfall类型的图表
 * https://echarts.apache.org/examples/zh/editor.html?c=bar-waterfall2
 * @param dv dataview实例
 * @param container 绘制的容器
 * @param projectName 项目名称，用来查找对应的项目
 * @param {ITimelineEventItemParsed[]} events 事件列表
 * @param opt 选项
 */
export function projectProcessingReport(
	dv: DataviewApi,
	container: HTMLElement,
	projectName: string,
	events: ITimelineEventItemParsed[],
	opt?: IProjectProcessingReportOpt,
) {
	const { debug = false, groupBy = 'week' } = opt ?? {};
	// @ts-ignore
	// dv.header(headerLevel, projectName);

	const groupByFunc = getGroupBy(groupBy);

	// 第一个图表
	const grouped: IGroupedProjectEvents = {};
	events.forEach(event => {
		const key = groupByFunc(event);
		const group = grouped[key];
		if (group) {
			group.push(event);
		} else {
			grouped[key] = [event];
		}
	});

	if (debug) {
		console.log('单个项目分组后的结果', grouped);
	}

	// 绘制
	draw(dv, container, projectName, grouped, opt);
}

function draw(
	dv: DataviewApi,
	container: HTMLElement,
	name: string,
	group: IGroupedProjectEvents,
	opt?: IProjectProcessingReportOpt,
) {
	const { debug = false } = opt || {};
	const xAxis = Object.keys(group).sort();
	const yValue = xAxis.map(key => {
		const events = group[key] || [];
		return events.reduce<TimeDurationValue>(
			(accu: TimeDurationValue, curr) => {
				// 单位处理
				const res = accu.add(curr.timeCost);
				return res;
			},
			new TimeDurationValue(0, TimeDurationUnit.Minute),
		);
	});

	let sumY: TimeDurationValue = new TimeDurationValue(
		0,
		TimeDurationUnit.Minute,
	);
	const stackY: TimeDurationValue[] = [sumY];

	for (let index = 0; index < yValue.length - 1; index++) {
		sumY = sumY.add(yValue[index]);
		stackY.push(sumY);
	}

	if (debug) {
		console.log('yValue', yValue, 'xAxis', xAxis, 'stackY', stackY);
	}

	const options: EChartsOption = {
		title: {
			text: `${name}:单位:${yValue[0]?.unit}`,
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			formatter: function (params) {
				let tar;
				// @ts-ignore
				if (params[1] && params[1].value !== '-') {
					// @ts-ignore
					tar = params[1];
				} else {
					// @ts-ignore
					tar = params[2];
				}
				return tar && tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
			},
		},
		legend: {
			data: ['timeCost'],
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: xAxis,
		},
		yAxis: {
			type: 'value',
		},
		series: [
			{
				name: 'Placeholder',
				type: 'bar',
				stack: 'Total',
				silent: true,
				itemStyle: {
					borderColor: 'transparent',
					color: 'transparent',
				},
				emphasis: {
					itemStyle: {
						borderColor: 'transparent',
						color: 'transparent',
					},
				},
				data: stackY.map(item => item.value),
			},
			{
				name: 'timeCost',
				type: 'bar',
				stack: 'Total',
				label: {
					show: true,
					position: 'top',
				},
				data: yValue.map(item => item.value),
			},
		],
	};

	if (debug) {
		console.log('options', options);
	}
	const echartPlugin =
		// @ts-ignore
		dv.app.plugins.plugins['echarts-light'];
	if (echartPlugin) {
		echartPlugin['render'](options, container);
	} else {
		new Notice('看起来echarts-light插件没有安装');
	}
}
