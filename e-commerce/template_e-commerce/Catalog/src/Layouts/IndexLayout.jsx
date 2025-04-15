import React from 'react';
import Navbar from '../Components/Navbar/Navbar';
import Demo from '../Pages/Demo/Demo';
import TitleMeta from '../Components/TitleMeta/TitleMeta';
export default function IndexLayout() {

    return (
        <div className='section-bg-color'>
            <TitleMeta />
            <Navbar />
            <div className='espaciobg'>
            </div>
            <Demo />
        </div>
    );
}
