import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  type TFile,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  mySetting: string;
}

const checkSimilar = (s1: string, s2: string): boolean => {
  let s1_lower = s1.toLowerCase();
  let s2_lower = s2.toLowerCase();

  return true;
};

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: "default",
};

export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon(
      "file-stack",
      "find duplicates",
      (_: MouseEvent) => {
        // Called when the user clicks the icon.
        const files = this.app.vault.getMarkdownFiles();
        const dupes: Set<TFile>[] = [];
        for (const f of files) {
          for (const other of files) {
            const set = dupes.find((s) => s.has(f));

            if (f === other) continue;
            if (set?.has(other)) continue;

            const name1 = f.basename;
            const name2 = other.basename;

            const similar = checkSimilar(name1, name2);

            if (similar) {
              if (!set) {
                dupes.push(new Set([f, other]));
              } else {
                set.add(other);
              }
            }
          }
        }

        for (const dupe of dupes) {
          let dupeString = "";
          dupe.forEach((d) => {
            dupeString += `${d.basename}\n`;
          });

          new Notice(dupeString);
        }
      },
    );
    // Perform additional things with the ribbon
    ribbonIconEl.addClass("my-plugin-ribbon-class");

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
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

class SampleSettingTab extends PluginSettingTab {
  plugin: MyPlugin;

  constructor(app: App, plugin: MyPlugin) {
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
          }),
      );
  }
}
