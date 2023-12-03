import { Notice, moment } from 'obsidian';
import type { DataviewApi } from 'obsidian-dataview';
import type { ITimelineEventItemParsed } from 'src/types';

interface IProjectOverviewOpt {
	debug?: boolean;

	/**
	 * 开始时间, format: 1982/04/23
	 */
	dateStart?: string;
	/**
	 * 结束时间，format: 1982/04/23
	 */
	dateEnd?: string;
}

/**
 * project项目概览
 */
export function projectOverview(
	dv: DataviewApi,
	container: HTMLElement,
	opt?: IProjectOverviewOpt,
) {
	const { debug = false } = opt || {};

	const page =
		// @ts-ignore
		dv.current();

	const timelinesProApi =
		// @ts-ignore
		dv.app.plugins.plugins['timelines-pro']?.api;

	if (!timelinesProApi) {
		new Notice('请先安装timelines-pro插件');
		console.error('请先安装timelines-pro插件', page);
		return;
	}

	const { searchTimelineEvents } =
		// @ts-ignore
		dv.app.plugins.plugins['timelines-pro'].api;

	const dateStart = opt?.dateStart
		? moment(opt?.dateStart)
				.startOf('day')
				.format('YYYY/MM/DD')
		: moment(page.time.valueOf()).startOf('week').format('YYYY/MM/DD');

	const dateEnd = opt?.dateEnd
		? moment(opt.dateEnd).endOf('day').format('YYYY/MM/DD')
		: moment(dateStart.valueOf()).endOf('week').format('YYYY/MM/DD');

	searchTimelineEvents({
		dateStart: dateStart,
		dateEnd: dateEnd,
	})
		.then((res: ITimelineEventItemParsed[]) => {
			dv.table(
				['file', 'title', 'timeCost', 'value', '项目标签'],
				res.map(item => {
					return [
						dv.fileLink(item.file.path),
						item.title,
						item.timeCost.toString(),
						item.value.toString(),
						item.parsedEventTags
							.filter(item => {
								return item.includes('Projects');
							})
							.join('\n'),
					];
				}),
			);
			// 统计Project
		})
		.catch((error: Error) => {
			new Notice(error.message || '查询出错');
			console.error(error);
		});
}
