import { PluginSettingTab, SecretComponent, Setting } from "obsidian";
import type R2SyncPlugin from "../main";
import {
  getStoredAccessKeyIdSecretName,
  getStoredSecretAccessKeySecretName,
} from "../sync/config";

export class R2SyncSettingTab extends PluginSettingTab {
  declare plugin: R2SyncPlugin;

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Cloudflare R2 sync" });

    this.addTextSetting({
      name: "Account ID",
      desc: "Used to derive the Cloudflare R2 endpoint.",
      value: this.plugin.settings.accountId,
      placeholder: "Cloudflare account ID",
      onChange: async (value) => {
        this.plugin.settings.accountId = value.trim();
        await this.plugin.saveSettings();
      },
    });

    this.addSecretSetting({
      name: "Access key ID",
      desc: "Select a secret from Obsidian secret storage.",
      value: getStoredAccessKeyIdSecretName(this.plugin.settings),
      onChange: async (value) => {
        this.plugin.settings.accessKeyIdSecretName = value.trim();
        await this.plugin.saveSettings();
      },
    });

    this.addSecretSetting({
      name: "Secret access key",
      desc: "Select a secret from Obsidian secret storage.",
      value: getStoredSecretAccessKeySecretName(this.plugin.settings),
      onChange: async (value) => {
        this.plugin.settings.secretAccessKeySecretName = value.trim();
        await this.plugin.saveSettings();
      },
    });

    this.addTextSetting({
      name: "Bucket",
      desc: "Cloudflare R2 bucket name.",
      value: this.plugin.settings.bucket,
      placeholder: "Bucket name",
      onChange: async (value) => {
        this.plugin.settings.bucket = value.trim();
        await this.plugin.saveSettings();
      },
    });

    this.addTextSetting({
      name: "Remote prefix",
      desc: "R2 prefix to scan for Markdown files.",
      value: this.plugin.settings.remotePrefix,
      placeholder: "clippings/",
      onChange: async (value) => {
        this.plugin.settings.remotePrefix = value;
        await this.plugin.saveSettings();
      },
    });

    this.addTextSetting({
      name: "Local folder",
      desc: "Vault folder where synced files will be created.",
      value: this.plugin.settings.localFolder,
      placeholder: "Clippings",
      onChange: async (value) => {
        this.plugin.settings.localFolder = value;
        await this.plugin.saveSettings();
      },
    });

    this.addNumberSetting({
      name: "Sync interval minutes",
      desc: "Set to 0 to disable periodic sync after startup.",
      value: this.plugin.settings.syncIntervalMinutes,
      minimum: 0,
      onValidChange: async (value) => {
        this.plugin.settings.syncIntervalMinutes = value;
        await this.plugin.saveSettings();
      },
    });

    this.addNumberSetting({
      name: "Max concurrent downloads",
      desc: "Maximum number of files to download in parallel.",
      value: this.plugin.settings.maxConcurrentDownloads,
      minimum: 1,
      onValidChange: async (value) => {
        this.plugin.settings.maxConcurrentDownloads = value;
        await this.plugin.saveSettings();
      },
    });

    new Setting(containerEl)
      .setName("Behavior")
      .setDesc(
        "This plugin reads Markdown files from Cloudflare R2 only. Existing vault files are never overwritten.",
      )
      .setHeading();
  }

  private addTextSetting({
    name,
    desc,
    value,
    placeholder,
    onChange,
  }: {
    name: string;
    desc: string;
    value: string;
    placeholder: string;
    onChange: (value: string) => Promise<void>;
  }) {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addText((text) =>
        text
          .setPlaceholder(placeholder)
          .setValue(value)
          .onChange(async (nextValue) => {
            await onChange(nextValue);
          }),
      );
  }

  private addNumberSetting({
    name,
    desc,
    value,
    minimum,
    onValidChange,
  }: {
    name: string;
    desc: string;
    value: number;
    minimum: number;
    onValidChange: (value: number) => Promise<void>;
  }) {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addText((text) => {
        text.inputEl.type = "number";
        text.inputEl.min = String(minimum);
        text.setValue(String(value)).onChange(async (rawValue) => {
          const nextValue = parseNumericSetting(rawValue, minimum);
          if (nextValue === null) {
            return;
          }

          await onValidChange(nextValue);
        });
      });
  }

  private addSecretSetting({
    name,
    desc,
    value,
    onChange,
  }: {
    name: string;
    desc: string;
    value: string;
    onChange: (value: string) => Promise<void>;
  }) {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addComponent((element) =>
        new SecretComponent(this.app, element).setValue(value).onChange(async (nextValue) => {
          await onChange(nextValue);
        }),
      );
  }
}

function parseNumericSetting(value: string, minimum: number): number | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < minimum) {
    return null;
  }

  return parsed;
}
