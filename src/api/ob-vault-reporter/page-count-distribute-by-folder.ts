import { Notice } from 'obsidian';
import type { DataviewApi } from 'obsidian-dataview';

/** 文件夹下的文件数量分布 */
export function pageCountDistributeByFolder(
	dv: DataviewApi,
	container: HTMLElement,
) {
	const pages = dv
		.pages()
		.groupBy(p => p.file.folder)
		.sort(p => p.rows.length)
		.map(p => ({ name: p.key || '根目录', value: p.rows.length }))
		.array()
		.reverse();

	const options = {
		title: {
			text: '文件夹文件数量矩阵图',
		},
		series: {
			type: 'treemap',
			itemStyle: {
				color: 'rgba(109, 40, 40, 1)',
				borderWidth: 2,
				borderColor: 'rgba(255, 255, 0, 0)',
			},
			data: pages,
		},
		type: 'basicTreemap',
	};

	const echartPlugin =
		// @ts-ignore
		dv.app.plugins.plugins['echarts-light'];
	if (echartPlugin) {
		echartPlugin['render'](options, container);
	} else {
		new Notice('看起来echarts-light插件没有安装');
	}
}
