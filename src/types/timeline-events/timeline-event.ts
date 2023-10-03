import type { TFile } from 'obsidian';
import type { BaseValue } from './data-value/base-value';
import type { TimeDurationValue } from './data-value/time-duration-value';

/**
 * 精确到日(YYYY/MM/DD)
 */
export type TimelineDate = string;
/** 时间范围 */
export type TimelineDateRange = [
	TimelineDate | undefined,
	TimelineDate | undefined,
];
/**
 * timeline event模型（存放在dataset中）
 */
export interface ITimelineEventItemSource {
	/** 类名 */
	class?: string;
	/**
	 * event的标签，;分割
	 * @example
	 * tag1;tag2;tag3
	 */
	eventTags?: string;
	/**
	 * 日期, 精确到日(YYYY/MM/DD)，兼有排序和聚合的功能
	 */
	date?: TimelineDate;
	/** 日期的提示 */
	dateDescription?: string;
	/**
	 * 开始时间，格式同date
	 * @see {@link date}
	 */
	dateStart?: TimelineDate;
	/**
	 * 结束时间，格式同date
	 * @see {@link date}
	 */
	dateEnd?: TimelineDate;
	/**
	 * 用来做id, 最终的id优先级为  dateId > sortOrder
	 */
	dateId?: string;
	/**
	 * 名字，用于标记一类event
	 * 如,项目的名字
	 */
	name?: string;
	/**
	 * 标题，用于展示
	 */
	title?: string;
	/** 图片地址（相对于event的文件） */
	img?: string;
	/**
	 * 该事件的值，如5km, 40min
	 */
	value?: string;
	/**
	 * 事件花费的时长(输入), 如50min, 4h
	 */
	timeCost: string;
	/**
	 * 是否是里程碑
	 * 为'true'的时候表示是里程碑
	 */
	milestone?: string;
	/**
	 * 内容
	 */
	content?: string;
}

export interface ITimelineEventItemParsed
	extends Omit<ITimelineEventItemSource, 'value' | 'milestone' | 'timeCost'> {
	/** 图片的地址 */
	imgRealPath?: string;
	/** 内部html */
	content?: string;

	/** 解析eventTags之后的数据(按照;分割了一下) */
	parsedEventTags?: string[];

	/**
	 * 事件的值(输出，如距离)
	 */
	value?: BaseValue;

	/**
	 * 事件花费的时长(输入)
	 */
	timeCost: TimeDurationValue;

	/**
	 * 里程碑描述
	 */
	milestone?: string;

	/** 关联的文件 */
	file: TFile;
}
