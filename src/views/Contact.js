import React from 'react';
import MainContent from '../components/Contact/MainContent';
import Parallex from '../components/Contact/Parallex';
import Banner from '../components/Banner';

const Contact = (props) => (
	<div className="page-wrapper">
	    <Banner title="Contact"/>	
		<MainContent/>
		<Parallex/>
	</div>
);

export default Contact;