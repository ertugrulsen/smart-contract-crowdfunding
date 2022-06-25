
contract CrowdFundingWithDeadline {


    enum State { Ongoing, Failed, Succeeded, PaidOut }
    event CampaignFinished(
        address addr,
        uint totalCollected,
        bool succeeded
    );
    
    uint public counter = 0;
    int time;
    string public name;
    uint public targetAmount;
    int public campaignDeadline;
    address public beneficiary;
    State public state;
    mapping(address => uint) public amounts;
    bool public collected;
    uint public totalCollected;

    modifier inState(State expectedState) {
        require(state == expectedState, "Invalid state");
        _;
    }

    constructor(
        string memory campaignName,
        uint targetAmountEth,
        int durationInMin,
        address beneficiaryAddress
    )
        public
    {
        name = campaignName;
        targetAmount = targetAmountEth * 1 ether;
        campaignDeadline = durationInMin;
        beneficiary = beneficiaryAddress;
        state = State.Ongoing;
    }

    function contribute() public payable inState(State.Ongoing) {
        require(beforeDeadline(), "No contributions after a deadline");
        amounts[msg.sender] += msg.value;
        totalCollected += msg.value;
        incrementCounter();

        if (totalCollected >= targetAmount) {
            collected = true;
        }
    }

    function finishCrowdFunding() public inState(State.Ongoing) {
        require(!beforeDeadline(), "Cannot finish campaign before a deadline");

        if (!collected) {
            state = State.Failed;
        } else {
            state = State.Succeeded;
        }

        emit CampaignFinished(address(this), totalCollected, collected);
    }

    function collect() public inState(State.Succeeded) {
        if (payable(beneficiary).send(totalCollected)) {
            state = State.PaidOut;
        } else {
            state = State.Failed;
        }
    }

    function withdraw() public inState(State.Failed) {
        require(amounts[msg.sender] > 0, "Nothing was contributed");
        uint contributed = amounts[msg.sender];
        amounts[msg.sender] = 0;

        if (!payable(msg.sender).send(contributed)) {
            amounts[msg.sender] = contributed;
        }
    }

    function beforeDeadline() public view returns(bool) {
        if(currentTime() < 0){
            return false;
        }
        return currentTime() < campaignDeadline;
    }

     function currentTime() internal view returns(int) {
        return time;
    }

    function setCurrentTime(int newTime) public {
        time = newTime;
    }

    function getTotalCollected() public view returns(uint) {
        return totalCollected;
    }

    function inProgress() public view returns (bool) {
        return state == State.Ongoing || state == State.Succeeded;
    }

    function isSuccessful() public view returns (bool) {
        return state == State.PaidOut;
    }
    function etherToWei(uint sumInEth) public pure returns(uint) {
        return sumInEth * 1 ether;
    }

    function minutesToSeconds(uint timeInMin) public pure returns(uint) {
        return timeInMin * 1 minutes;
    }
    function incrementCounter() public {
        counter += 1;
    }
    function getBackers() public view returns (uint) {
        return counter;
    }

}


       


