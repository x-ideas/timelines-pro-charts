import type { DataviewApi } from 'obsidian-dataview';
import type { EChartsOption } from 'echarts';
import { Notice } from 'obsidian';

/**
 * page按照root文件夹分布
 */
export function pageDistributeByRootFolder(
	dv: DataviewApi,
	container: HTMLElement,
) {
	const data: { name: string; value: number }[] = [];
	dv.app.vault.getRoot().children.forEach(child => {
		if (child.path.split('.')[1] != 'md') {
			//console.log(child.path)
			data.push({
				name: child.path,
				value: dv.pages(`"${child.path}"`).length,
			});
		}
	});

	const options: EChartsOption = {
		backgroundColor: 'transparent',
		title: {
			text: '笔记数量',
			left: 'center',
			top: 20,
			textStyle: {
				color: '#ccc',
			},
		},
		tooltip: {
			trigger: 'item',
		},
		visualMap: {
			show: false,
			min: 0,
			max: 50,
		},
		series: [
			{
				name: '笔记数量',
				type: 'pie',
				radius: '75%',
				center: ['50%', '50%'],
				data: data.sort(function (a, b) {
					return a.value - b.value;
				}),
				roseType: 'radius',
				labelLine: {
					smooth: 0.2,
					length: 10,
					length2: 20,
				},
				itemStyle: {
					color: '#c23531',
					shadowBlur: 200,
				},
				animationType: 'scale',
				animationEasing: 'elasticOut',
				animationDelay: function (idx) {
					return Math.random() * 200;
				},
			},
		],
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
