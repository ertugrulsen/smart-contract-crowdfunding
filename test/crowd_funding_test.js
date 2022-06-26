let CrowdFundingWithDeadline = artifacts.require('./CrowdFundingWithDeadline')

contract('CrowdFundingWithDeadline', function(accounts) {

    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000;
    const ONGOING_STATE = '0';
    const FAILED_STATE = '1';
    const SUCCEEDED_STATE = '2';
    const PAID_OUT_STATE = '3';

    beforeEach(async function() {
        contract = await CrowdFundingWithDeadline.new('funding', 1, 10, beneficiary, {from: contractCreator, gas: 2000000});
    });


 
    it('crowdfunding succeeded', async function() {
        await contract.contribute({value: ONE_ETH, from: contractCreator});
        await contract.setCurrentTime(9);
        await contract.finishCrowdFunding();

        let state = await contract.state.call();
        let details = await contract.getCampaign();
        let getStatus = await contract.getStatus();

        //console.log(getStatus.valueOf());
        expect(String(getStatus.valueOf())).to.equal(SUCCEEDED_STATE);
    });
    it('crowdfunding failed', async function() {
        await contract.contribute({value: ONE_ETH, from: contractCreator});
        await contract.setCurrentTime(11);
        await contract.finishCrowdFunding();

        let state = await contract.state.call();
        let details = await contract.getCampaign();
        expect(String(state.valueOf())).to.equal(FAILED_STATE);
    });


    

 


   

});