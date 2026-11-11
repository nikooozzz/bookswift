function flattenBookmarks(nodes, list = []) {
  for (const node of nodes) {
    if (node.url) {
      list.push({ title: node.title, url: node.url });
    }
    if (node.children) {
      flattenBookmarks(node.children, list);
    }
  }
  return list;
}

browser.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-launcher") {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]?.id) return;

    try {
      const bookmarkTree = await browser.bookmarks.getTree();
      const allBookmarks = flattenBookmarks(bookmarkTree);

      browser.tabs.sendMessage(tabs[0].id, {
        action: "toggle-launcher",
        bookmarks: allBookmarks
      });
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    }
  }
});