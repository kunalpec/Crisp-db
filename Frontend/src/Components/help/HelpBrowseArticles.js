// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import styles from './helpBrowseArticles.module.css';

// const topics = [
//   { id: 1, title: 'Getting Started', description: 'Best place to get everything right from the beginning with Mediator', color: '#f25c5c' },
//   { id: 2, title: 'Install Mediator', description: 'How to install  Mediator on your website & apps.', color: '#3498db' },
//   { id: 3, title: 'Developers', description: 'Documentation for our REST & JS APIs.', color: '#000000' },
//   { id: 4, title: 'Customization', description: 'Adjust Mediator for your needs.', color: '#00bfa5' },
//   { id: 5, title: 'My Account', description: 'Everything related to your account: avatar, password, notifications & more.', color: '#f39c12' },
//   { id: 6, title: 'Mediator Inbox', description: 'How to reply to your users using Mediators Inbox.', color: '#9b59b6' },
//   { id: 7, title: 'Troubleshooting', description: 'Having Trouble.?Find a solutions there!.', color: '#2b5971' },
//   { id: 8, title: 'Integrations', description: 'How touse Mediator integrations to external services', color: '#459c42' },
//   { id: 9, title: 'AI Chatbot & Automations', description: 'Get the best Mediator Chatbot AI and Automations Hub.', color: '#000fac' },
//   { id: 10, title: 'Automate', description: 'Automate Mediator to engage & target your visitors & users.', color: '#603418' },
//   { id: 11, title: 'Billing & Pricing', description: 'Help with Mediator billing & pricing matters.', color: '#f25c5b' },
//   { id: 12, title: 'My Contacts', description: 'Do more with your Mediator contacts.', color: '#68233a' },
// ];
// const HelpBrowseArticles=()=> {
//   const navigate = useNavigate();

//   const handleCardClick = (topic) => {
//     navigate(`/help/${(topic.title)}`);
//   };

//   return (
//     <div className={styles.helpBrowseSectionWrapper}>
//       <h2 className={styles.helpBrowseSectionHeading}>Browse All Categories</h2>
//       <div className={styles.helpBrowseSectionGrid}>
//         {topics.map(topic => (
//           <div
//             key={topic.id}
//             className={styles.helpBrowseSectionCard}
//             onClick={() => handleCardClick(topic)}
//           >
//             <div className={styles.helpBrowseSectionIcon}></div>
//             <div className={styles.helpBrowseSectionText}>
//               <span
//                 className={styles.helpBrowseSectionLabel}
//                 style={{ backgroundColor: topic.color }}
//               >
//                 {topic.title}
//               </span>
//               <p className={styles.helpBrowseSectionDescription}>{topic.description}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// export default HelpBrowseArticles
