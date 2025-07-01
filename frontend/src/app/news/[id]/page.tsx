"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { FaUser, FaCalendarAlt, FaGlobe, FaLink, FaChevronLeft, FaRegNewspaper, FaCheckCircle, FaExclamationCircle, FaQuestionCircle, FaArrowRight, FaNewspaper } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const sentimentColor = {
  Positive: "bg-green-100 text-green-700 border-green-300",
  Negative: "bg-red-100 text-red-700 border-red-300",
  Neutral: "bg-gray-100 text-gray-700 border-gray-300",
  Cautious: "bg-yellow-100 text-yellow-700 border-yellow-300",
};
const factCheckColor = {
  verified: "bg-green-100 text-green-700 border-green-300",
  unverified: "bg-gray-100 text-gray-700 border-gray-300",
};
const categoryColor = {
  Politics: "bg-blue-100 text-blue-700 border-blue-300",
  Economy: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Crime: "bg-red-100 text-red-700 border-red-300",
  Environment: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Health: "bg-green-100 text-green-700 border-green-300",
  Technology: "bg-pink-100 text-pink-700 border-pink-300",
  Diplomacy: "bg-indigo-100 text-indigo-700 border-indigo-300",
  Sports: "bg-orange-100 text-orange-700 border-orange-300",
  Culture: "bg-purple-100 text-purple-700 border-purple-300",
  Other: "bg-gray-100 text-gray-700 border-gray-300",
};

const sentimentIcon = {
  Positive: <FaCheckCircle className="inline mr-1" />,
  Negative: <FaExclamationCircle className="inline mr-1" />,
  Neutral: <FaRegNewspaper className="inline mr-1" />,
  Cautious: <FaQuestionCircle className="inline mr-1" />,
};
const factCheckIcon = {
  verified: <FaCheckCircle className="inline mr-1" />,
  unverified: <FaRegNewspaper className="inline mr-1" />,
};

// Utility to get backend base URL
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    
    // If running on localhost, use port 5000 for backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:5000`;
    }
    
    // For VM deployment, use the same hostname but port 5000
    // This assumes the backend is accessible on port 5000
    return `${protocol}//${hostname}:5000`;
  }
  return '';
};

export default function NewsDetail() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullNews, setShowFullNews] = useState(false);
  const [showMediaCoverage, setShowMediaCoverage] = useState(false);
  const [showFactCheckScore, setShowFactCheckScore] = useState(false);
  const [showRelatedArticles, setShowRelatedArticles] = useState(false);
  const [showSentimentBreakdown, setShowSentimentBreakdown] = useState(false);
  const [showMoreFromSource, setShowMoreFromSource] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    
    const fetchArticle = async () => {
      try {
        const apiUrl = `${getApiBase()}/api/articles/${id}`;
        console.log('Fetching article from:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        setData(response.data);
      } catch (err: any) {
        console.error('Article fetch error:', err);
        if (err.code === 'ECONNREFUSED') {
          setError("Cannot connect to backend server. Please check if the backend is running on port 5000.");
        } else if (err.response?.status === 404) {
          setError("Article not found. It may have been removed or the ID is invalid.");
        } else if (err.response?.status >= 500) {
          setError("Backend server error. Please check the server logs.");
        } else {
          setError(`Failed to load article: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error || !data) return <div className="flex items-center justify-center min-h-screen text-red-600">{error || "No data found."}</div>;

  const summary = data.summary || {};
  const extras = data.extras || {};
  const links = extras.links || [];
  const cat = (summary.news_category || "Other") as keyof typeof categoryColor;
  const sent = (summary.sentiment_toward_bangladesh || "Neutral") as keyof typeof sentimentColor;
  const fact = (summary.fact_check?.status || "unverified") as keyof typeof factCheckColor;

  // Parse summary JSON if needed
  let parsedSummary: any = summary;
  try {
    if (typeof summary === 'string') {
      parsedSummary = JSON.parse(summary);
    }
  } catch (e) {
    parsedSummary = summary;
  }

  const matchesSection = (title: string, matches: any[]) => (
    <div className="mb-4">
      <div className="font-semibold mb-1">{title}</div>
      {matches.length === 0 ? (
        <div className="text-gray-400 text-sm italic">None</div>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {matches.map((m, i) => (
            <li key={i}>
              <a href={m.url} className="text-primary-600 underline hover:text-primary-800 transition" target="_blank" rel="noopener noreferrer">{m.title}</a>
              <span className="ml-2 text-xs text-gray-500">({m.source})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Fallback summary logic
  const getFallbackSummary = () => {
    if (parsedSummary.extractSummary && parsedSummary.extractSummary.length < 600) return parsedSummary.extractSummary;
    if (parsedSummary.summary && parsedSummary.summary.length < 600) return parsedSummary.summary;
    if (data.text) {
      const sentences = data.text.match(/[^.!?]+[.!?]+/g) || [];
      const fallback = sentences.slice(0, 2).join(' ').trim();
      if (fallback.length > 0 && fallback.length < 600) return fallback;
    }
    return "No summary available.";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-14">
        {/* Header Buttons */}
        <div className="flex justify-between items-center mb-10 gap-8 flex-wrap">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white text-lg font-semibold hover:bg-primary-700 shadow transition" onClick={() => router.push("/")}> <FaChevronLeft /> Back to Dashboard</button>
          {data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 shadow transition"
            >
              <FaLink /> View Original
            </a>
          )}
        </div>
        {/* Header Card */}
        <div className="rounded-3xl shadow-2xl bg-white overflow-hidden mb-14 relative max-w-4xl mx-auto">
          <div className="relative h-64 md:h-80 flex items-end bg-gray-100">
            {data.image && (
              <img src={data.image} alt="news" className="absolute inset-0 w-full h-full object-cover object-center opacity-80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-0" />
            <div className="relative z-10 p-10 w-full">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {data.favicon && <img src={data.favicon} alt="favicon" className="w-8 h-8 rounded inline-block bg-white p-1" />}
                <span className="text-white font-semibold text-xl flex items-center gap-1"><FaGlobe /> {summary.source_domain || data.source}</span>
                <span className={`px-3 py-1 rounded border text-sm font-semibold ${categoryColor[cat]}`}>{summary.news_category || "Other"}</span>
                <span className={`px-3 py-1 rounded border text-sm font-semibold flex items-center gap-1 ${sentimentColor[sent]}`}>{sentimentIcon[sent]}{summary.sentiment_toward_bangladesh}</span>
                <span className={`px-3 py-1 rounded border text-sm font-semibold flex items-center gap-1 ${factCheckColor[fact]}`}>{factCheckIcon[fact]}{summary.fact_check?.status || "unverified"}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-3 leading-tight">{data.title}</h1>
              <div className="flex flex-wrap gap-8 items-center text-gray-200 text-lg">
                <span className="flex items-center gap-2"><FaUser /> {data.author || "Unknown"}</span>
                <span className="flex items-center gap-2"><FaCalendarAlt /> {data.publishedDate ? format(new Date(data.publishedDate), "MMM d, yyyy") : "-"}</span>
                {links.length > 0 && (
                  <span className="flex items-center gap-2"><FaLink />
                    {links.map((l: string, i: number) => {
                      let display = l.replace(/^https?:\/\//, '').replace(/\/$/, '');
                      if (display.length > 40) display = display.slice(0, 37) + '...';
                      return (
                        <a
                          key={i}
                          href={l}
                          className="underline hover:text-primary-200 transition mr-2"
                          target="_blank"
                          rel="noopener noreferrer"
                          title={l}
                        >
                          {display}
                        </a>
                      );
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Summary Box */}
        <div className="mb-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FaRegNewspaper className="text-blue-500 text-3xl" />
            <span className="font-bold text-2xl text-gray-800">Summary</span>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-8 rounded-2xl shadow whitespace-pre-line text-gray-800 text-lg min-h-[80px]">
            {getFallbackSummary()}
          </div>
        </div>
        {/* Detailed News (collapsible) */}
        <div className="mb-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FaRegNewspaper className="text-yellow-500 text-3xl" />
            <span className="font-bold text-2xl text-gray-800">Detailed News</span>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-8 rounded-2xl shadow text-gray-800 text-lg min-h-[80px]">
            {showFullNews ? (
              <>
            {data.text}
                <button className="mt-4 px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition" onClick={() => setShowFullNews(false)}>
                  Show less
                </button>
              </>
            ) : (
              <>
                <div className="line-clamp-4 overflow-hidden" style={{ maxHeight: '7.5em' }}>{data.text}</div>
                <button className="mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" onClick={() => setShowFullNews(true)}>
                  Read full news
                </button>
              </>
            )}
          </div>
        </div>
        {/* Media Coverage Analysis (collapsible, combined) */}
        <div className="bg-white rounded-2xl shadow p-8 mb-14 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FaGlobe className="text-primary-600 text-2xl" />
            <span className="font-bold text-xl text-primary-700">Media Coverage Analysis</span>
            <button
              className={`ml-auto px-4 py-1 rounded font-semibold transition ${showMediaCoverage ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              onClick={() => setShowMediaCoverage(v => !v)}
            >
              {showMediaCoverage ? 'Hide' : 'Show'}
            </button>
          </div>
          {showMediaCoverage && (
            <>
              <div className="mb-4 text-blue-700 font-medium text-base">News Coverage in Local and International Media</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2"><FaGlobe className="text-primary-600" />Bangladeshi Media Coverage</h4>
                  <div className="mb-3 text-gray-700 text-base flex-1">{parsedSummary.mediaCoverageSummary?.bangladeshiMediaCoverage || parsedSummary.mediaCoverageSummary?.bangladeshiMedia || "Not covered"}</div>
                  <div className="font-semibold">Bangladeshi Matches</div>
                  {(parsedSummary.supportingArticleMatches?.bangladeshiMatches && parsedSummary.supportingArticleMatches.bangladeshiMatches.length > 0) ? (
                    <ul className="list-disc pl-5 text-sm">
                      {parsedSummary.supportingArticleMatches.bangladeshiMatches.map((m: any, i: number) => (
                        <li key={i}>
                          <a href={m.url} className="text-primary-600 underline hover:text-primary-800 transition" target="_blank" rel="noopener noreferrer">{m.title}</a>
                          <span className="ml-2 text-xs text-gray-500">({m.source})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-400 italic">None</div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2"><FaGlobe className="text-primary-600" />International Media Coverage</h4>
                  <div className="mb-3 text-gray-700 text-base flex-1">{parsedSummary.mediaCoverageSummary?.internationalMediaCoverage || parsedSummary.mediaCoverageSummary?.internationalMedia || "Not covered"}</div>
                  <div className="font-semibold">International Matches</div>
                  {(parsedSummary.supportingArticleMatches?.internationalMatches && parsedSummary.supportingArticleMatches.internationalMatches.length > 0) ? (
                    <ul className="list-disc pl-5 text-sm">
                      {parsedSummary.supportingArticleMatches.internationalMatches.map((m: any, i: number) => (
                        <li key={i}>
                          <a href={m.url} className="text-primary-600 underline hover:text-primary-800 transition" target="_blank" rel="noopener noreferrer">{m.title}</a>
                          <span className="ml-2 text-xs text-gray-500">({m.source})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-400 italic">None</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Fact Check & Score (collapsible, combined) */}
        <div className="bg-white rounded-2xl shadow p-8 mb-14 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FaCheckCircle className="text-primary-600 text-2xl" />
            <span className="font-bold text-xl text-primary-700">Fact Check & Score</span>
            <button
              className={`ml-auto px-4 py-1 rounded font-semibold transition ${showFactCheckScore ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              onClick={() => setShowFactCheckScore(v => !v)}
            >
              {showFactCheckScore ? 'Hide' : 'Show'}
            </button>
          </div>
          {showFactCheckScore && (
            <>
              <div className="mb-4 text-blue-700 font-medium text-base">Verification Status and Credibility of the News</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fact Check Details */}
                <div>
                  <div className="font-semibold mb-3 text-primary-700 flex items-center gap-2 text-lg"><FaCheckCircle className="text-primary-600" />Fact Check Details</div>
                  <div className="mb-4">
                    <div className="font-medium mb-2">Status: <span className={`px-2 py-1 rounded text-sm font-semibold ${factCheckColor[fact]}`}>{parsedSummary.factCheck?.status || "unverified"}</span></div>
                    {parsedSummary.factCheck?.sources && parsedSummary.factCheck.sources.length > 0 && (
                      <div className="mb-4">
                        <div className="font-medium mb-2">Verification Sources:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {parsedSummary.factCheck.sources.map((source: string, i: number) => (
                            <li key={i}>
                              <a href={source} className="text-primary-600 underline hover:text-primary-800 transition" target="_blank" rel="noopener noreferrer">{source}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {parsedSummary.factCheck?.similarFactChecks && parsedSummary.factCheck.similarFactChecks.length > 0 && (
                      <div>
                        <div className="font-medium mb-2">Similar Fact Checks:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {parsedSummary.factCheck.similarFactChecks.map((check: any, i: number) => (
                            <li key={i}>
                              <a href={check.url} className="text-primary-600 underline hover:text-primary-800 transition" target="_blank" rel="noopener noreferrer">{check.title}</a>
                              <span className="ml-2 text-xs text-gray-500">({check.source})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {/* Score */}
                <div className="flex flex-col items-center justify-center">
                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-lg"><FaCheckCircle className="text-green-500" />Score</div>
                  <div className="text-3xl font-mono text-primary-700">{typeof data.score === "number" ? data.score.toFixed(3) : "-"}</div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Sentiment Breakdown (collapsible) */}
        <div className="bg-white rounded-2xl shadow p-8 mb-14 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <FaCheckCircle className="text-primary-600" />
            <span className="font-semibold text-primary-700 flex-1">Sentiment Breakdown</span>
            <button
              className={`ml-auto px-4 py-1 rounded font-semibold transition ${showSentimentBreakdown ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              onClick={() => setShowSentimentBreakdown(v => !v)}
            >
              {showSentimentBreakdown ? 'Hide' : 'Show'}
            </button>
          </div>
          {showSentimentBreakdown && (
            <>
              <div className="mb-4 text-blue-700 font-medium text-base">Analysis of the News's Tone and Bias</div>
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <div className="font-medium mb-2">Positive</div>
                  <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-green-700 rounded-full" style={{ width: `${(data.sentiment_analysis?.positive || 0) * 100}%` }}></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-2">Negative</div>
                  <div className="h-2 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-red-700 rounded-full" style={{ width: `${(data.sentiment_analysis?.negative || 0) * 100}%` }}></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-2">Neutral</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-gray-700 rounded-full" style={{ width: `${(data.sentiment_analysis?.neutral || 0) * 100}%` }}></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-2">Cautious</div>
                  <div className="h-2 bg-yellow-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-yellow-700 rounded-full" style={{ width: `${(data.sentiment_analysis?.cautious || 0) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Related Articles (collapsible) */}
        <div className="card mb-14 animate-fadein bg-white rounded-2xl shadow p-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <FaArrowRight className="text-primary-600" />
            <h2 className="text-2xl font-semibold text-primary-700 flex-1">Related Articles</h2>
            <button
              className={`ml-auto px-4 py-1 rounded font-semibold transition ${showRelatedArticles ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              onClick={() => setShowRelatedArticles(v => !v)}
            >
              {showRelatedArticles ? 'Hide' : 'Show'}
            </button>
          </div>
          {showRelatedArticles && (
          <div className="flex overflow-x-auto gap-6 pb-2">
            {(data.related_articles || []).length === 0 ? (
              <div className="text-gray-500">No related articles found.</div>
            ) : (
              (data.related_articles || []).map((art: any) => (
                <a key={art.id} href={`/news/${art.id}`} className="min-w-[260px] max-w-xs bg-gray-50 rounded shadow p-5 hover:bg-primary-50 transition flex flex-col gap-2">
                  <div className="font-bold text-primary-700 truncate text-lg">{art.title}</div>
                  <div className="text-xs text-gray-500">{art.source}</div>
                  <div className="flex gap-1 text-xs">
                      <span className={`px-2 py-0.5 rounded ${categoryColor[(art.category as keyof typeof categoryColor) || "Other"]}`}>{art.category}</span>
                    <span className={`px-2 py-0.5 rounded ${sentimentColor[(art.sentiment as keyof typeof sentimentColor) || "Neutral"]}`}>{art.sentiment}</span>
                  </div>
                </a>
              ))
            )}
          </div>
          )}
        </div>
        {/* More from this source (collapsible) */}
        <div className="bg-white rounded-2xl shadow p-8 mb-14 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <FaLink className="text-primary-600" />
            <span className="font-semibold text-primary-700 flex-1">More from this source</span>
            <button
              className={`ml-auto px-4 py-1 rounded font-semibold transition ${showMoreFromSource ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              onClick={() => setShowMoreFromSource(v => !v)}
            >
              {showMoreFromSource ? 'Hide' : 'Show'}
            </button>
          </div>
          {showMoreFromSource && (
            <div className="text-gray-700 text-base">
              {data.more_from_source || "No more articles found from this source."}
            </div>
          )}
          </div>
        <style jsx global>{`
          .animate-fadein { animation: fadein 0.7s; }
          @keyframes fadein { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
} 