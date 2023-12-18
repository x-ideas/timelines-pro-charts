import type { EChartsOption } from 'echarts';
import { Notice } from 'obsidian';
import type { DataviewApi } from 'obsidian-dataview';

interface IOptions {
	/** 查询条件，跟dataview一样 */
	source?: string;
}

/**
 * 标签分布-词云的形式
 * @example
 * ```dataviewjs
 * 	const proChartsApi = dv.app.plugins.plugins['timelines-pro-charts'].api;
 * 	proChartsApi.tagDistribute(dv, this.container, {})
 * ```
 */
export function tagDistribute(
	dv: DataviewApi,
	container: HTMLElement,
	opt: IOptions = {},
) {
	const pages = dv.pages(opt.source);

	const datas = pages
		.flatMap(p => {
			return p.file.etags;
		})
		.groupBy(p => p)
		.map(p => ({
			name:
				// @ts-ignore
				p.key.replace('#', ''),
			value: p.rows.length,
		}))
		.array();
	const search = 'tag'; // content
	datas.forEach(data => {
		// @ts-ignore
		data['search'] = search;
	});

	const options: EChartsOption = {
		tooltip: {},
		// @ts-ignore
		series: [
			{
				type: 'wordCloud',

				// The shape of the "cloud" to draw. Can be any polar equation represented as a
				// callback function, or a keyword present. Available presents are circle (default),
				// cardioid (apple or heart shape curve, the most known polar equation), diamond (
				// alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

				shape: 'pentagon',

				// Keep aspect ratio of maskImage or 1:1 for shapes
				// This option is supported from echarts-wordcloud@2.1.0
				keepAspect: false,

				// A silhouette image which the white area will be excluded from drawing texts.
				// The shape option will continue to apply as the shape of the cloud to grow.

				// Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
				// Default to be put in the center and has 75% x 80% size.

				width: '100%',
				height: '80%',
				right: undefined,
				bottom: undefined,

				// Text size range which the value in data will be mapped to.
				// Default to have minimum 12px and maximum 60px size.

				sizeRange: [20, 80],

				// Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

				rotationRange: [-30, -30],
				rotationStep: 45,

				// size of the grid in pixels for marking the availability of the canvas
				// the larger the grid size, the bigger the gap between words.

				gridSize: 8,

				// set to true to allow word being draw partly outside of the canvas.
				// Allow word bigger than the size of the canvas to be drawn
				drawOutOfBound: false,

				// If perform layout animation.
				// NOTE disable it will lead to UI blocking when there is lots of words.
				layoutAnimation: true,

				// Global text style
				textStyle: {
					fontFamily: 'sans-serif',
					fontWeight: 'bold',
					// Color can be a callback function or a color string
					color: function () {
						// Random color
						return (
							'rgb(' +
							[
								Math.round(Math.random() * 200) + 50,
								Math.round(Math.random() * 150),
								Math.round(Math.random() * 150) + 50,
							].join(',') +
							')'
						);
					},
				},
				emphasis: {
					textStyle: {
						textShadowBlur: 2,
						color: '#528',
					},
				},

				// Data is an array. Each array item must have name and value property.
				data: datas,
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
