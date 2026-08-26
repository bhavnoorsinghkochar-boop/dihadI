const fs = require('fs');

let workerCode = fs.readFileSync('src/components/worker/WorkerApp.tsx', 'utf8');
const workerTarget = `      {/* 0% Commission VIP Pass Subscription Modal */}
      <WorkerSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        worker={currentWorker}
        onSubscribe={(method) => subscribeWorkerPremium(currentWorker.id, method)}
        onTopUpWallet={(amount) => topUpWorkerWallet(amount)}
      />`;
if(workerCode.includes(workerTarget)) {
    workerCode = workerCode.replace(workerTarget, "");
    fs.writeFileSync('src/components/worker/WorkerApp.tsx', workerCode);
    console.log("Worker modal removed");
}

let customerCode = fs.readFileSync('src/components/customer/CustomerApp.tsx', 'utf8');
const customerTarget = `      {/* Customer Gold Membership (1 Month Free Service) Modal */}
      {currentCustomer && (
        <CustomerSubscriptionModal
          isOpen={showCustomerSubscriptionModal}
          onClose={() => setShowCustomerSubscriptionModal(false)}
          customer={currentCustomer}
          onSubscribe={(method) => subscribeCustomerPremium(currentCustomer.id, method)}
        />
      )}`;
if(customerCode.includes(customerTarget)) {
    customerCode = customerCode.replace(customerTarget, "");
    fs.writeFileSync('src/components/customer/CustomerApp.tsx', customerCode);
    console.log("Customer modal removed");
}
