import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'strategy-desk.json');

const envKeys = ['NEWS_API_KEY','OPENAI_API_KEY','EMAIL_SMTP_HOST','EMAIL_SMTP_USER','EMAIL_SMTP_PASS','DAILY_BRIEF_TO_EMAIL','SESSION_SECRET'];

const sample = {
  stories: [
    {id:'rbi-credit-risk', headline:'RBI commentary keeps bank credit quality in focus', source:'Reserve Bank of India', publishedAt:'2026-06-21T03:15:00Z', category:'Regulation', region:'India', summary:'Supervisory signals point to sharper lender scrutiny of unsecured and wholesale credit.', score:92, product:'Private Credit', audience:'Banks, NBFCs, wealth managers', url:'https://www.rbi.org.in/', clusterKey:'rbi-credit', facts:['Regulatory commentary is treated as a primary source signal.','Credit underwriting and portfolio monitoring are the relevant themes.'], related:['nbfc-funding','bond-demand']},
    {id:'sebi-ai-disclosure', headline:'SEBI disclosure focus raises bar for investment communication', source:'Securities and Exchange Board of India', publishedAt:'2026-06-20T11:00:00Z', category:'Regulation', region:'India', summary:'Market intermediaries face continued pressure to keep investor communication clear and evidenced.', score:89, product:'AltWealth Research', audience:'Financial advisers, institutions', url:'https://www.sebi.gov.in/', clusterKey:'sebi-disclosure', facts:['Regulatory updates should be checked against SEBI circulars before publication.','Marketing interpretation must avoid unsupported claims.'], related:['wealth-content']},
    {id:'global-rates', headline:'Global rate expectations reshape demand for private market income', source:'Financial Times', publishedAt:'2026-06-19T09:30:00Z', category:'Markets', region:'Global', summary:'Investors are reassessing income strategies as rate-cut timing remains uncertain across major economies.', score:86, product:'Private Credit', audience:'Family offices, HNIs, institutions', url:'https://www.ft.com/markets', clusterKey:'global-rates', facts:['Rate uncertainty affects fixed-income allocation discussions.','Private market income products need risk-first framing.'], related:['bond-demand']},
    {id:'preipo-liquidity', headline:'Pre-IPO liquidity discussions return as late-stage companies stay private longer', source:'Moneycontrol', publishedAt:'2026-06-18T06:45:00Z', category:'Alternative Investments', region:'India', summary:'Longer private-company timelines are increasing interest in secondary and unlisted-share access.', score:84, product:'Unlisted Shares', audience:'HNIs, family offices, investment professionals', url:'https://www.moneycontrol.com/news/business/ipo/', clusterKey:'preipo-liquidity', facts:['Companies staying private longer can create secondary-market demand.','Suitability and liquidity risk should be highlighted.'], related:['family-office']},
    {id:'bond-demand', headline:'Listed bond platforms see growing investor attention to predictable income', source:'Economic Times', publishedAt:'2026-06-17T08:10:00Z', category:'Investments', region:'India', summary:'Curated bond access remains relevant for investors seeking transparent cash-flow profiles.', score:81, product:'Listed Bonds', audience:'HNIs, advisers, business owners', url:'https://economictimes.indiatimes.com/markets/bonds', clusterKey:'bond-demand', facts:['Bond content must distinguish yield, credit risk, duration and liquidity.','Listed access can support transparency-led education.'], related:['rbi-credit-risk']},
    {id:'family-office', headline:'Family offices expand private market research capabilities', source:'The Ken', publishedAt:'2026-06-16T05:00:00Z', category:'Wealth Management', region:'India', summary:'Sophisticated allocators are demanding deeper diligence before making alternative investments.', score:80, product:'AltWealth Research', audience:'Family offices, institutions', url:'https://the-ken.com/', clusterKey:'family-office-research', facts:['Family offices increasingly value specialist diligence.','Education-led content can support trust.'], related:['preipo-liquidity']}
  ],
  ideas: [], saved: [], briefs: []
};

async function initDb(){ await mkdir(DB_DIR,{recursive:true}); if(!existsSync(DB_FILE)) await writeFile(DB_FILE, JSON.stringify(sample,null,2)); }
async function db(){ await initDb(); return JSON.parse(await readFile(DB_FILE,'utf8')); }
async function saveDb(data){ await writeFile(DB_FILE, JSON.stringify(data,null,2)); }
function json(res, code, payload){ res.writeHead(code, {'content-type':'application/json'}); res.end(JSON.stringify(payload)); }
function ideaFromStory(story, type='LinkedIn Post'){
  const confidence = story.source.includes('Reserve') || story.source.includes('SEBI') ? 'High' : 'Medium';
  return { id:`idea-${story.id}-${type.toLowerCase().replaceAll(' ','-')}`, type, title:`What ${story.category.toLowerCase()} signals mean for ${story.audience.split(',')[0]}`, hook:`${story.headline} is not just news; it is an allocation conversation.`, coreArgument:`AltWealth can translate the development into a risk-aware discussion on ${story.product}.`, relevantNow:story.summary, targetAudience:story.audience, product:story.product, cta:'Speak with AltWealth for a research-led view before making allocation decisions.', structure:['Context: what changed','Investor implication','Risk and suitability lens','Where AltWealth adds perspective','Measured next step'], source:{title:story.headline,publisher:story.source,publicationDate:story.publishedAt,url:story.url,facts:story.facts}, interpretation:`This story is useful when framed as investor education rather than a prediction.`, viewpoint:`AltWealth should connect the development to ${story.product} with transparent risk context.`, confidence, whyPublish:'It converts a timely market development into a practical institutional conversation.', whyCare:'The audience needs concise interpretation, not another headline summary.', channel:type.includes('Instagram')?'Instagram':'LinkedIn', timeframe:'Within 48 hours of source verification', strengthScore: Math.min(95, story.score), sourceConfidenceScore: confidence==='High'?92:78 };
}
function fullDraft(idea){ return `Draft: ${idea.title}\n\n${idea.hook}\n\n${idea.coreArgument}\n\nWhat matters now: ${idea.relevantNow}\n\nAltWealth view: ${idea.viewpoint}\n\nThis is not a recommendation. It is a prompt for better diligence, sharper suitability checks and clearer conversations with financially sophisticated investors.\n\n${idea.cta}`; }

createServer(async (req,res)=>{
  const url = new URL(req.url, `http://${req.headers.host}`);
  if(url.pathname.startsWith('/api/')){
    const data = await db();
    if(url.pathname==='/api/config') return json(res,200,{requiredKeys:envKeys, configured: Object.fromEntries(envKeys.map(k=>[k,Boolean(process.env[k])])), workflow:'Discover News → Understand Brief → Generate Content Idea → Generate Draft → Save → Publish Manually'});
    if(url.pathname==='/api/news') {
      const q=url.searchParams.get('q')?.toLowerCase(); const cat=url.searchParams.get('category');
      let stories=data.stories; if(cat&&cat!=='All') stories=stories.filter(s=>s.category===cat||s.region===cat||s.product===cat); if(q) stories=stories.filter(s=>JSON.stringify(s).toLowerCase().includes(q));
      return json(res,200,{stories});
    }
    if(url.pathname==='/api/ideas') return json(res,200,{ideas:data.stories.slice(0,5).flatMap(s=>['LinkedIn Article','LinkedIn Post','Instagram Post','Instagram Carousel','Instagram Reel'].map(t=>ideaFromStory(s,t)))});
    if(url.pathname==='/api/brief') return json(res,200,{brief:{timeZone:'Asia/Singapore', scheduledFor:'09:00', emailEnabled:Boolean(process.env.EMAIL_SMTP_HOST), india:data.stories.filter(s=>s.region==='India').slice(0,5), global:data.stories.filter(s=>s.region==='Global').slice(0,5), markets:data.stories.filter(s=>['Markets','Economy','Investments'].includes(s.category)).slice(0,5), alternatives:data.stories.filter(s=>['Alternative Investments','Wealth Management'].includes(s.category)).slice(0,3), ideas:data.stories.slice(0,5).map(s=>ideaFromStory(s,'LinkedIn Post'))}});
    if(req.method==='POST' && url.pathname==='/api/save'){ let body=''; for await (const c of req) body+=c; const item=JSON.parse(body||'{}'); data.saved.unshift({...item,id:item.id||crypto.randomUUID(),savedAt:new Date().toISOString()}); await saveDb(data); return json(res,201,{saved:data.saved}); }
    if(url.pathname==='/api/saved') return json(res,200,{saved:data.saved, folders:['Publish Soon','LinkedIn Articles','LinkedIn Posts','Instagram','Research','Market Trends','Evergreen Ideas']});
    if(req.method==='POST' && url.pathname==='/api/draft'){ let body=''; for await (const c of req) body+=c; const idea=JSON.parse(body||'{}'); return json(res,200,{draft:fullDraft(idea)}); }
    return json(res,404,{error:'Not found'});
  }
  const file = url.pathname==='/' ? 'index.html' : url.pathname.slice(1);
  try { const fp=path.join(__dirname,'public',file); const ext=path.extname(fp); const types={'.html':'text/html','.css':'text/css','.js':'text/javascript'}; res.writeHead(200, {'content-type':types[ext]||'text/plain'}); res.end(await readFile(fp)); } catch { res.writeHead(404); res.end('Not found'); }
}).listen(PORT,()=>console.log(`Priyanshi's Strategy Desk running on http://localhost:${PORT}`));
