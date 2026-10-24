import React from 'react';
import { TimelineDashboard, CausalLens, WhatIfPlayground } from '../components';

const DashboardView: React.FC = () => {
    return (
        <div>
            <h1>Dashboard</h1>
            <TimelineDashboard />
            <CausalLens />
            <WhatIfPlayground />
        </div>
    );
};

export default DashboardView;