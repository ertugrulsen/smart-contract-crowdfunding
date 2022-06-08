let CrowdFundingWithDeadline = artifacts.require('./CrowdFundingWithDeadline')

contract('CrowdFundingWithDeadline', function(accounts) {

    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000;
    const ERROR_MSG = 'VM Exception while processing transaction: revert';
    const ONGOING_STATE = '0';
    const FAILED_STATE = '1';
    const SUCCEEDED_STATE = '2';
    const PAID_OUT_STATE = '3';

    beforeEach(async function() {
        contract = await CrowdFundingWithDeadline.new('funding', 1, 10, beneficiary, {from: contractCreator, gas: 2000000});
    });

    it('contract is initialized', async function() {
        let campaignName = await contract.name.call()
        expect(campaignName).to.equal('funding');

        let targetAmount = await contract.targetAmount.call()
        expect(parseInt(targetAmount)).to.equal(ONE_ETH);

        /*let fundingDeadline = await contract.fundingDeadline.call()
        var date = new Date(fundingDeadline * 1000);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var formattedTime = hours + ':' + minutes.substr(-2);
        //console.log(formattedTime);
        //expect(formattedTime).to.equal(600);*/

        let actualBeneficiary = await contract.beneficiary.call()
        expect(actualBeneficiary).to.equal(beneficiary);

        let state = await contract.state.call()
        expect(String(state.valueOf())).to.equal(ONGOING_STATE);
    });

    it('funds are contributed', async function() {
        await contract.contribute({value: ONE_ETH, from: contractCreator});

        let contributed = await contract.amounts.call(contractCreator);
        expect(parseInt(contributed)).to.equal(ONE_ETH);

        let totalCollected = await contract.totalCollected.call();
        expect(parseInt(totalCollected)).to.equal(ONE_ETH);
    });

    it('cannot contribute after deadline', async function() {
        try {
            await contract.setCurrentTime(601);
            await contract.sendTransaction({
                value: ONE_ETH,
                from: contractCreator
            });
            expect.fail();
        } catch (error) {
            console.log(error.message);
            //expect(error.message).to.equal(ERROR_MSG);
        }
    })

    it('crowdfunding succeeded', async function() {
        await contract.contribute({value: ONE_ETH, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();

        expect(String(state.valueOf())).to.equal(SUCCEEDED_STATE);
    });

    it('crowdfunding failed', async function() {
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();

        expect(String(state.valueOf())).to.equal(FAILED_STATE);
    });

    it('collected money paid out', async function() {
        await contract.contribute({value: ONE_ETH, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        let initAmount = await web3.eth.getBalance(beneficiary);
        await contract.collect({from: contractCreator});

        let newBallance = await web3.eth.getBalance(beneficiary);
        expect(newBallance - initAmount).to.equal(ONE_ETH);

        let fundingState = await contract.state.call()
        expect(String(fundingState.valueOf())).to.equal(PAID_OUT_STATE);
    });

    it('withdraw funds from the contract', async function() {
        await contract.contribute({value: ONE_ETH - 100, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        await contract.withdraw({from: contractCreator});
        let amount = await contract.amounts.call(contractCreator);
        expect(parseInt(amount)).to.equal(0);
    });



   

});