import https from "https";

const startUrl = new URL("https://hexact.io/");
const foundedLinks = [];
const statusObj = {};
let counter = 0;

const load = (myUrl,cb) => {
	https.get(myUrl,  res => {
		let data = '';
		res.on('data', chunk => {
			data += chunk;
		});
		res.on('end', () => {
			cb(myUrl,res.statusCode,data);
		})
	}).on('error', err => {
		console.log(err.message,myUrl);
	})
};

const format = (url,statusCode,data) => {
	counter++
	if (statusCode >= 200 && statusCode < 300) {
		linkFinder(data,url).forEach((link)=>{
			if(foundedLinks.indexOf(link) == -1){
				foundedLinks.push(link)
				load(link,format);
			}
		})
	}

	if(statusObj.hasOwnProperty(statusCode)){
		statusObj[statusCode].push(url)
	}else{
		statusObj[statusCode] = [url]
	}
	console.log(statusCode,url);
	if(foundedLinks.length == counter-1) {
		for(let code in statusObj){
			console.log(code, statusObj[code].length)
		}
	}
}
const linkFinder = (data,url) => {
		const root = new URL(url).origin;
		const pattern = /href="([^\'\"]+)/g;
		let qurl;
		if(data.match(pattern)) {
			return data.match(pattern).map((el)=>{
				let href = el.split('"')[1];
				if(!(
					href.includes("@")||
					href.includes("#")||
					href.includes("http")||
					href.includes(".css")||
					href.includes(".svg")||
					href.includes(".png")
				)){
					if(href.indexOf("/") ) href = "/"+href ;
					qurl = root+href;
					return qurl;
				}
			}).filter(un => un !== undefined);
		}else{ return []}
};
load(startUrl,format);
