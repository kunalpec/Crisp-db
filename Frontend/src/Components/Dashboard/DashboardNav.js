import React from 'react';
import styles from './dashboardNav.module.css';
// import 'react-icons/fa'
import { FaGift, FaSearch, FaUserFriends, FaGlobe, FaUsers, FaRobot,FaBook,FaChartBar,FaBan} from 'react-icons/fa';
import { IoMdMail  } from 'react-icons/io';
import { MdSettings } from 'react-icons/md';
// import { BiBookBookmark } from 'react-icons/bi';



const DashboardNav = () => {
  return (
    <div className={styles['dashboardNav-container']}>
      <div className={styles['dashboardNav-header']}>
        <div className={styles['dashboardNav-companyIcon']}></div>
        <div>
          <div className={styles['dashboardNav-Name']}>company name</div>
          <div className={styles['dashboardNav-Domain']}>domain</div>
        </div>
      </div>

      <button className={styles['dashboardNav-getStarted']}>
        <FaGift />
         Get Started <span className={styles['dashboardNav-notificationbadge']}>8</span>
      </button>

      <div className={styles['dashboardNav-section']}>
        <div className={styles['dashboardNav-inboxHeader']}>
          <IoMdMail className={styles['dashboardNav-icon']} />
          <span>Inbox</span>
        </div>

        <div className={styles['dashboardNav-subtitle']}>Default Inboxes</div>
        <div className={styles['dashboardNav-defaultInbox']}>
          <span className={styles['dashboardNav-inboxIcon']}>💬</span>
          Main Inbox
        </div>

        <div className={styles['dashboardNav-subtitle']}>Your Inboxes</div>
        <div className={styles['dashboardNav-newSubInbox']}>+ New sub-inbox</div>

        <div className={styles['dashboardNav-subtitle']}>Other Inboxes</div>
        <div className={styles['dashboardNav-otherInbox']}><FaBan/>Spam</div>
        <div className={styles['dashboardNav-otherInbox']}>
          <FaGlobe />
           Visitors
        </div>
        <div className={styles['dashboardNav-otherInbox']}>
          <FaUsers />
           Contacts
        </div>
        
        <div className={styles['dashboardNav-otherInbox']}>
          <FaRobot  />
          AI Automations
        </div>
        <div className={styles['dashboardNav-otherInbox']}>
          <FaBook />
        Knowledge Base
        </div>
        <div className={styles['dashboardNav-otherInbox']}>
          <FaChartBar />
         Analytics
        </div>
      </div>
      <hr></hr>

      <div className={styles['dashboardNav-bottom']}>
        <div className={styles['dashboardNav-option']}>
            <FaSearch />
             Search</div>
        <div className={styles['dashboardNav-option']}>
            <FaUserFriends />
             Plugins</div>
        <div className={styles['dashboardNav-option']}>
            <MdSettings />
             Settings</div>
      </div>

      <div className={styles['dashboardNav-user']}>
        <div className={styles['dashboardNav-userIcon']}></div>
        <div>
          <div className={styles['dashboardNav-userName']}>username</div>
          <div className={styles['dashboardNav-userEmail']}>userEmail.gmail.com</div>
        </div>
      </div>

  
 
    </div>
  );
};

export default DashboardNav;





