import type { DataviewApi, Literal } from 'obsidian-dataview';
import { Notice } from 'obsidian';
import type { DVPage } from 'src/types';
import dayjs from 'dayjs';

interface IOptions {
	/**
	 * 开始时间
	 * @example '2021-01-01'
	 */
	start: string;
	/**
	 * 结束时间
	 * @example '2021-01-01'
	 */
	end: string;
	/**
	 * 过滤条件
	 */
	where?: (page: DVPage) => boolean;
	/**
	 * 页面查询的语句，与obsidian-dataview保持一致 {@link https://blacksmithgu.github.io/obsidian-dataview/reference/sources/}
	 */
	query?: string;
	/**
	 * 排序, 与obsidian-dataview保持一致
	 * @example
	 *
	 */
	sort?: string;

	// groupBy:

	/**
	 * @returns	{string} 相同的返回值，会聚合在一起
	 */
	// groupBy: (page: DVPage) => string;
}
/**
 * 文件创建的分布-按照时间统计
 */
export function pageCreatedDistributeByDay(dv: DataviewApi, options: IOptions) {
	// const groupPageCountInfo = dv
	// 	.pages(options.query)
	// 	.filter(page => {
	// 		if (typeof options?.where === 'function') {
	// 			return !!options?.where?.(page);
	// 		}
	// 		return true;
	// 	})
	// 	.groupBy(options.groupBy)
	// 	.map(p => {
	// 		return {
	// 			key: p.key,
	// 			count: p.rows.length,
	// 		};
	// 	})
	// 	.array()
	// 	.reduce<{ [key: string]: number }>((accu, curr) => {
	// 		accu[curr.key] = curr.count;
	// 		return accu;
	// 	}, {});

	// 生成时间
	function getData() {
		const start = dayjs(options.start);
	}
}

function getGroupByFunc(): (p: DVPage) => string {
	return groupByDay;
}

function groupByDay(p: DVPage): string {
	// return p.file
	return '';
}
