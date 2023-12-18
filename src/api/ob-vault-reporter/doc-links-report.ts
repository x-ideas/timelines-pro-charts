import type { DataviewApi } from 'obsidian-dataview';

import type { EChartsOption } from 'echarts';
import { Notice } from 'obsidian';

/**
 * @typedef DV
 * @type {import('obsidian-dataview/lib/api/plugin-api').DataviewApi}
 */

/**
 * 按照加权平均，计算文档之间的链接分数
 * @param {DataviewApi} dv
 * @param {HTMLElement} container
 *
 * @example
 * ```dataviewjs
 *  const proChartsApi = dv.app.plugins.plugins['timelines-pro-charts'].api;
 * 	proChartsApi.docsReport(dv, this.container)
 * ```
 */
export function docsReport(dv: DataviewApi, container: HTMLElement) {
	const value = getVaultDocLinkFactor(dv);

	const echartPlugin =
		// @ts-ignore
		app.plugins.plugins['echarts-light'];

	if (!echartPlugin) {
		new Notice('看起来echarts-light插件没有安装');
		return;
	}

	const option: EChartsOption = {
		// @ts-ignore
		series: [
			{
				type: 'gauge',
				startAngle: 180,
				endAngle: 0,
				center: ['50%', '75%'],
				radius: '90%',
				min: 0,
				max: 5,
				splitNumber: 5,
				axisLine: {
					lineStyle: {
						width: 6,
						color: [
							[0.25, '#FF6E76'],
							[0.5, '#FDDD60'],
							[0.75, '#58D9F9'],
							[1, '#7CFFB2'],
						],
					},
				},
				pointer: {
					icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
					length: '12%',
					width: 20,
					offsetCenter: [0, '-60%'],
					itemStyle: {
						color: 'inherit',
					},
				},
				axisTick: {
					length: 12,
					lineStyle: {
						color: 'inherit',
						width: 2,
					},
				},
				splitLine: {
					length: 20,
					lineStyle: {
						color: 'inherit',
						width: 5,
					},
				},
				axisLabel: {
					color: '#464646',
					fontSize: 20,
					distance: -60,
					rotate: 'tangential',
					formatter: function (value) {
						if (value === 5) {
							return 'SS';
						} else if (value === 4) {
							return 'S';
						} else if (value === 3) {
							return 'A';
						} else if (value === 2) {
							return 'B';
						} else if (value === 1) {
							return 'C';
						}
						return '';
					},
				},
				title: {
					offsetCenter: [0, '-10%'],
					fontSize: 20,
				},
				detail: {
					fontSize: 30,
					offsetCenter: [0, '-35%'],
					valueAnimation: true,
					formatter: function (value) {
						return value.toFixed(3);
					},
					color: 'inherit',
				},
				data: [
					{
						value: value,
						name: '文档链接因子',
					},
				],
			},
		],
	};

	// return {
	// 	factor: value,
	// 	option,
	// };

	echartPlugin['render'](option, container);
}

function getVaultDocLinkFactor(dv: DataviewApi) {
	const pages = dv.pages();

	const count = pages.length;
	const weigh = pages.array().reduce((acc, page) => {
		// 没有链接的当作0
		const s = page.file.inlinks.length || 0;
		return acc + s;
	}, 0);

	const value = weigh / count;

	return value.toFixed(3);
}
