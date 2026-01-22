import Main from "../Components/main-container/Main";
import Pricing from "../Components/Pricing/Pricing";
import Integrationnextsection from '../Components/integration/Integration'
import Apphero from "../Components/apps/Apphero";
import Help from '../Components/help/Help'
import HelpTopicArticles from "../Components/help/HelpTopicArticles";


// further menu 
import Widgets from '../Components/furtherMenu/Widgets'
import KnowledgeBase from "../Components/furtherMenu/Knowledge/KnowledgeBase";

import SignUpForm from "../Components/signUp_Login/signUpForm";
import LoginForm from "../Components/signUp_Login/LoginForm";
import MainDashboard from "../Components/Dashboard/MainDashboard";

import ForgotPasswordForm from "../Components/signUp_Login/forgot/ForgotPasswordForm";
import ResetPassword from "../Components/signUp_Login/forgot/ResetPassword";

 

export const routes=[
    {path:'/',  element:<Main/> },
    { path:'/Pricing',  element:<Pricing/> },
    { path:'/Integration',  element:<Integrationnextsection/> },
    {path: '/App', element: <Apphero/>},
     { path:'/help',  element:<Help/> },
      { path: "/help/:topicName", element:<HelpTopicArticles/>},

  // further menu
    { path : '/widget', element : <Widgets/>},
    {path:'/knowledge', element:<KnowledgeBase/>},


    { path:'/signup',  element:<SignUpForm/> },
    { path:'/login',  element:<LoginForm/> },
    { path:'/inbox',  element:<MainDashboard/> },
    { path:'/forgotpassword',  element:<ForgotPasswordForm/> },
    { path:'/resetpassword',  element:<ResetPassword/> },
]