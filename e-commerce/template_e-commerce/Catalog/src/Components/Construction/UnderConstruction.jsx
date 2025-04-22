import React from 'react';
import './UnderConstruction.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTools } from '@fortawesome/free-solid-svg-icons';

export default function UnderConstruction() {
    return (
        <div className="under-construction">
            <FontAwesomeIcon icon={faTools} size="3x" />
            <h1>Page Under Construction</h1>
            <p>This section is currently being built. Please check back later.</p>
        </div>
    );
}
