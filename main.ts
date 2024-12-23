import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	moment
} from "obsidian";

// Remember to rename these classes and interfaces!

interface LylesPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: LylesPluginSettings = {
	mySetting: "default",
};

export default class LylesPlugin extends Plugin {
	settings: LylesPluginSettings;

	async onload() {
		await this.loadSettings();

		// This is a sample icon that I copied, but it doesn't work for some reason.
		// addIcon('myicon', `<rect width="100" height="100" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" fill="currentColor"/><path d="M10 12h4" fill="currentColor"/>`);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"book-type",
			"Lyles Ribbon Icon",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-lyles-modal-simple",
			name: "Open Lyles modal (simple)",
			callback: () => {
				new LylesModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "lyles-editor-command",
			name: "Lyles editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Lyles Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-user-input-modal",
			name: "Open Input modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new UserInputModal(this.app, (result) => {
							const name = result['Name'];
							new Notice(`Hello, ${name}!`);
						}).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		this.addCommand({
			id: "insert-todays-date",
			name: "Insert today's date",
			editorCallback: (editor: Editor) => {
				editor.replaceRange(
					moment().format("YYYY-MM-DD"),
					editor.getCursor()
				);
			},
		});

		this.addRibbonIcon("dice", "LylesRibbon", () => {
			new Notice("Hello from Lyle");
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new LylesSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			// console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(
				() => console.log("setInterval Here"),
				5 * 60 * 1000
			)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class LylesModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class UserInputModal extends Modal {
	constructor(app: App, onSubmit: (result: {'Name': string}) => void) {
		super(app);
		this.setTitle("What's your name?");

		let name = "";
		new Setting(this.contentEl).setName("Name").addText((text) =>
			text.onChange((value) => {
				name = value;
			})
		);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.close();
					onSubmit({'Name': name});
				})
		);
	}
}
class LylesSettingTab extends PluginSettingTab {
	plugin: LylesPlugin;

	constructor(app: App, plugin: LylesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
