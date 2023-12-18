import { Notice, moment } from 'obsidian';
import type { DataviewApi } from 'obsidian-dataview';
import type { ITimelineEventItemParsed } from 'src/types';

interface IactivityEventOverviewOpt {
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

interface IGroupedProjectEvents {
	[projectTag: string]: ITimelineEventItemParsed[];
}

/**
 * project概览()
 */
export async function projectOverview(
	dv: DataviewApi,
	container: HTMLElement,
	opt?: IactivityEventOverviewOpt,
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

	const res: ITimelineEventItemParsed[] = await searchTimelineEvents({
		eventTags: 'Projects',
		dateStart: dateStart,
		dateEnd: dateEnd,
	});

	if (debug) {
		console.log('查找到的结果', res);
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

			//

			projectProcessingReport(dv, divContainer, tag, events, opt);
		});

	// .then((res: ITimelineEventItemParsed[]) => {
	// 	dv.table(
	// 		['file', 'title', 'timeCost', 'value', '项目标签'],
	// 		res.map(item => {
	// 			return [
	// 				dv.fileLink(item.file.path),
	// 				item.title,
	// 				item.timeCost.toString(),
	// 				item.value.toString(),
	// 				item.parsedEventTags
	// 					.filter(item => {
	// 						return item.includes('Projects');
	// 					})
	// 					.join('\n'),
	// 			];
	// 		}),
	// 	);
	// 	// 统计Project
	// })
	// .catch((error: Error) => {
	// 	new Notice(error.message || '查询出错');
	// 	console.error(error);
	// });
}
