import { App, Modal } from "obsidian";

export class R2SyncModal extends Modal {
  constructor(
    app: App,
    private readonly placeholderText: string,
  ) {
    super(app);
  }

  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText("r2-sync starter");
    contentEl.empty();
    contentEl.createEl("p", {
      text: "This is the starter modal for the future r2-sync plugin.",
    });
    contentEl.createEl("p", {
      text: `Placeholder setting: ${this.placeholderText}`,
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
