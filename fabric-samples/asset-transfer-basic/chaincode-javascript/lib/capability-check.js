'use strict';
const { ClientIdentity } = require('fabric-shim');

async function checkCapability(ctx, requiredCapability) {
    try {
        const clientObject = new ClientIdentity(ctx);
        const userCapabilities = clientObject.getAttributeValue('capabilities');

        if (!userCapabilities) {
            throw new Error('Access denied! User has no capabilities');
        }

        if (userCapabilities.includes(requiredCapability)) {
            return true;
        }
        else{
            throw new Error(`Access denied! Insufficient permissions. Required capability: ${requiredCapability}`);
        }
    } catch (error) {
        console.error('An error occurred in checkCapability:', error.message);
        throw error;
    }
}

async function checkDoctorCapability(ctx, requiredCapability) {
    return await checkCapability(ctx, requiredCapability);
}

async function checkPatientCapability(ctx, requiredCapability) {
    return await checkCapability(ctx, requiredCapability);
}

async function checkAsstDoctorCapability(ctx, requiredCapability) {
    return await checkCapability(ctx, requiredCapability);
}

module.exports = {
    checkDoctorCapability,
    checkPatientCapability,
    checkAsstDoctorCapability
};
