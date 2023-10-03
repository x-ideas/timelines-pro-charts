import type { TFile } from 'obsidian';
import type { Literal } from 'obsidian-dataview';

/**
 * dataview page类型
 */
export type DVPage = Record<string, Literal> & {
	file: TFile;
};
