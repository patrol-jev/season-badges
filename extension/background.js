// season-badges 확장 · 원작 patrol_jev (https://github.com/patrol-jev/season-badges)
// 아이콘을 누른 그 탭에만 seasons.js 를 얹는다. 한 번 더 누르면 걷힌다(seasons.js 가 스스로 닫음).
// 권한은 activeTab 뿐이라, 누르기 전에는 어떤 페이지도 읽지 않는다.
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["seasons.js"] });
  } catch (e) {
    // 크롬 설정 화면 · 웹 스토어 같은 곳은 브라우저가 막는다. 조용히 넘어간다.
  }
});
