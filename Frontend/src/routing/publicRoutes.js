import Main from "../Components/main-container/Main";
import Pricing from "../Components/Pricing/Pricing";
import Integrationnextsection from "../Components/integration/Integration";
import Apphero from "../Components/apps/Apphero";
import Help from "../Components/help/Help";
import HelpTopicArticles from "../Components/help/HelpTopicArticles";
import Widgets from "../Components/furtherMenu/Widgets";
import KnowledgeBase from "../Components/furtherMenu/Knowledge/KnowledgeBase";
import AiChatbotIntro from "../Components/AIChatBot/AiChatbotIntro";
import OtherWidgetChat from "../Components/OtherChat";
import PricingPage from "../Components/PlanCard/PricingPage"
export const publicRoutes = [
  { path: "/", element: <Main /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/integration", element: <Integrationnextsection /> },
  { path: "/app", element: <Apphero /> },
  { path: "/help", element: <Help /> },
  { path: "/help/:topicName", element: <HelpTopicArticles /> },
  { path: "/widget", element: <Widgets /> },
  { path: "/knowledge", element: <KnowledgeBase /> },
  { path: "/chatbot", element: <AiChatbotIntro /> },
  { path: "/widget-chat", element: < OtherWidgetChat /> },
  { path: "/Plans", element: <PricingPage /> }
];
