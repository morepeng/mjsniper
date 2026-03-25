
function doGet(e) {
  var tk = e.parameter.tk || '2330.TW';
  var interval = e.parameter.interval || '1d';
  
  // 1. 抓取 K線圖資料
  var chartUrl = 'https://query2.finance.yahoo.com/v8/finance/chart/' + tk + '?interval=' + interval + '&range=6mo';
  var chartRes = UrlFetchApp.fetch(chartUrl, {muteHttpExceptions: true});
  var chartData = JSON.parse(chartRes.getContentText());
  
  // 2. 抓取深度基本面資料 (Yahoo 隱藏端點，GAS 抓取絕對不會被擋 CORS)
  var fundUrl = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary/' + tk + '?modules=defaultKeyStatistics,financialData,summaryDetail';
  var fundRes = UrlFetchApp.fetch(fundUrl, {muteHttpExceptions: true});
  var fundData = {};
  
  try {
    var fJson = JSON.parse(fundRes.getContentText());
    if(fJson.quoteSummary && fJson.quoteSummary.result) {
      var res = fJson.quoteSummary.result[0];
      fundData = {
        market_cap: res.summaryDetail && res.summaryDetail.marketCap ? res.summaryDetail.marketCap.raw : 0,
        trailing_eps: res.defaultKeyStatistics && res.defaultKeyStatistics.trailingEps ? res.defaultKeyStatistics.trailingEps.raw : 0,
        roe: res.financialData && res.financialData.returnOnEquity ? res.financialData.returnOnEquity.raw : 0,
        revenue_growth: res.financialData && res.financialData.revenueGrowth ? res.financialData.revenueGrowth.raw : 0,
        pe_ratio: res.summaryDetail && res.summaryDetail.trailingPE ? res.summaryDetail.trailingPE.raw : 0,
        dividend_yield: res.summaryDetail && res.summaryDetail.dividendYield ? res.summaryDetail.dividendYield.raw : 0
      };
    }
  } catch(err) {
    fundData = { error: "解析失敗" }; 
  }
  
  // 3. 打包回傳
  var result = {
    chart: chartData.chart,
    fundamentals: fundData
  };
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

