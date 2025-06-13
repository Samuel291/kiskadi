chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    const url = details.url;

    if (url.includes("web.whatsapp.com/send")) {
        chrome.tabs.query({}, function(tabs) {
            const existingTab = tabs.find(tab => tab.url && tab.url.includes("web.whatsapp.com"));

            if (existingTab && existingTab.id !== details.tabId) {

                // Atualiza a aba existente com o novo link
                chrome.tabs.update(existingTab.id, { url: url });

                // Fecha a aba nova que tentou abrir
                chrome.tabs.remove(details.tabId);
            }
        });
    }
});