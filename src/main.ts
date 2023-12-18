import { Plugin } from 'obsidian';
import {
	dailyCreateReport,
	docsReport,
	pageCountDistributeByFolder,
	pageDistributeByRootFolder,
	tagDistribute,
} from 'src/api/ob-vault-reporter';
import { projectProcessingReportAll } from './api/project-reporter';
import './config/dayjs';
import { activityEventOverview } from './api/activity-reporter';
import { projectOverview } from './api/project-reporter/project-overview';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

// const DEFAULT_SETTINGS: MyPluginSettings = {
// 	mySetting: 'default',
// };

export default class MyChartPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {}

	onunload() {}

	api = {
		// ob reporter
		pageDistributeByRootFolder: pageDistributeByRootFolder,
		pageCountDistributeByFolder: pageCountDistributeByFolder,
		tagDistribute: tagDistribute,
		dailyCreateReport: dailyCreateReport,
		docsReport: docsReport,
		// project report
		projectProcessingReportAll: projectProcessingReportAll,
		projectOverview: projectOverview,
		// activity
		activityEventOverview: activityEventOverview,
	};

	async loadSettings() {
		// this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		// await this.saveData(this.settings);
	}
}
