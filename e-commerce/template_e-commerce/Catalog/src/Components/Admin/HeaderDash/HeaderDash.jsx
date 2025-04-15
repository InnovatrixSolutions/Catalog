import React, { useState } from 'react';
import './HeaderDash.css';
import ButonScreen from '../ButonScreen/ButonScreen';
import InputSearch from '../InputSearch/InputSearch';
import InfoUser from '../InfoUser/InfoUser';
import ButonInstallAppNav from '../ButonInstallAppNav/ButonInstallAppNav'
import { Link as Anchor } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import QrGenerator from '../QrGenerator/QrGenerator';
import Estado from '../Estado/Estado';
export default function HeaderDash() {


    return (
        <div className={`HeaderDashContain`}>
            <InputSearch />

            <div className='deFlexHeader'>
                <ButonScreen />
                <Estado />
                <ButonInstallAppNav />
                <Anchor to={'/'} className='link'>
                    <FontAwesomeIcon icon={faHome} /> Tienda
                </Anchor>
                <QrGenerator />
                <InfoUser />
            </div>


        </div>
    );
}
