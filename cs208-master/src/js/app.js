App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,
//   // $.ajaxSetup({async: false}); 

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("bktokenSale.json", function(BKTokenSale) {
      App.contracts.bktokenSale = TruffleContract(BKTokenSale);
      App.contracts.bktokenSale.setProvider(App.web3Provider);
      App.contracts.bktokenSale.deployed().then(function(BKTokenSale) {
        console.log("BK Token Sale Address:", BKTokenSale.address);
      });
    }).done(function() {
      $.getJSON("bktoken.json", function(BKToken) {
        App.contracts.bktoken = TruffleContract(BKToken);
        App.contracts.bktoken.setProvider(App.web3Provider);
        App.contracts.bktoken.deployed().then(function(BKToken) {
          console.log("BK Token Address:", BKToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.bktokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },
  
  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err == null) {
        console.log("account",account);
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
        // console.log(App.account);
      }
    })
    App.loading=false;
    loader.hide();
    content.show();
    

    // Load token sale contract
    App.contracts.bktokenSale.deployed().then(function(instance){
      BKTokenSaleInstance=instance;
      return BKTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return BKTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.bktoken.deployed().then(function(instance) {
        BKTokenInstance = instance;
        return BKTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.BK-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
          
    });


  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.bktokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 5000000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      $('#loader').hide();
      $('#content').show();
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});