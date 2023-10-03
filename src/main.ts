import {
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from 'obsidian';
import {
	pageCountDistributeByFolder,
	pageDistributeByRootFolder,
	tagDistribute,
} from 'src/api/ob-vault-reporter';
import { projectProcessingReportAll } from './api/project-reporter';
import './config/dayjs';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
};

export default class MyChartPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {}

	onunload() {}

	api = {
		// ob reporter
		pageDistributeByRootFolder: pageDistributeByRootFolder,
		pageCountDistributeByFolder: pageCountDistributeByFolder,
		tagDistribute: tagDistribute,
		// project report
		projectProcessingReportAll: projectProcessingReportAll,
	};

	async loadSettings() {
		// this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		// await this.saveData(this.settings);
	}
}
