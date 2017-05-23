/**
 * main
 * Created by dcorns on 2/27/16
 * Copyright © 2016 Dale Corns
 */
'use strict';
const grids = require('../modules/drc-grids');
const acquireLargeCardView = require('../modules/acquire-large-card-view');
const configureCardCollectionView = require('../modules/configure-card-collection-view');
const ajaxPostJson = require('../modules/ajax-post-json');
const view = {};//view will be responsible for all view state changes and elements
let loggedIn = false;
let prizeData = [];
//Store will be responsible for all data state
if(!(window.localStorage.getItem('authorized'))) window.localStorage.setItem('authorized','no');
const store = {
  current:{
    prizeIndex:0,
    partQuantityIndex:1,
    partQuantityValue:0,
    prize: false
  },
  authorized: window.localStorage.getItem('authorized')
};
const loginResource = 'https://pjpk6esqw5.execute-api.us-west-2.amazonaws.com/prod/monoplylogin';
const remoteDataUrl = 'https://monopoly-d9e3c.firebaseio.com/bob.json';
const authorizationResource = 'https://pjpk6esqw5.execute-api.us-west-2.amazonaws.com/prod/monopolyauthorization';
const userDataResource = 'https://pjpk6esqw5.execute-api.us-west-2.amazonaws.com/prod/userdata';
const updateUserDataResource = 'https://pjpk6esqw5.execute-api.us-west-2.amazonaws.com/prod/userdataupdate';
view.current = {prize: false};
const defineViewFunctions = (view) => {
  view.setCurrent = (prop, val) => {
    view.current[prop] = val;
  };
  view.positionViewBox = (x, y, elId) => {
    const el = document.getElementById(elId);
    el.setAttribute('viewBox', `${x} ${y} 112 95`);
  };
  view.setWinningTicketOnPrizeCard = (prize) => {
    const winningTicket = checkForRareTicket(prize);
    if (winningTicket) {
      document.getElementById(`w${prize.viewId.substr(1)}`).textContent = winningTicket;
    }
    else {
      document.getElementById(`w${prize.viewId.substr(1)}`).textContent = '';
    }
  };
  view.cardSelected = (target) => {
    const x = target.x.baseVal.value;
    const y = target.y.baseVal.value;
    view.positionViewBox(x,y,'svgRoot');

    const prizeId = target.id.substr(1);
    document.getElementById(`w${prizeId}`).classList.add('less');
    store.current.prizeIndex = prizeData.findIndex((pd) => pd.viewId === target.id);
    store.current.prize = store.setCurrentPrize(prizeData[store.current.prizeIndex]);
    const largeCardHeaderBottom = 30.5;
    const addC1Xoffset = 7, partC1Xoffset = 15, minusC1Xoffset = 44, addC2Xoffset = 66, partC2Xoffset = 74,
      minusC2Xoffset = 103;
    const btnRow1Offset = largeCardHeaderBottom + 1.5;
    const prize = store.current.prize;
    view.largeCardClose.setAttribute('cx', (x + 105).toString());
    view.largeCardClose.setAttribute('cy', (y + 5).toString());
    view.largeCardClose.setAttribute('data-PrizeId', prizeId);
    view.largeCardSubTitle.setAttribute('x', (x + 55).toString());
    view.largeCardSubTitle.setAttribute('y', (y + 24).toString());
    view.largeCardSubTitle.textContent = 'Winning Ticket: ' + prize.tickets.winner;
//First part add btn
    view.btnAdd0.setAttribute('cx', (x + addC1Xoffset).toString());
    view.btnAdd0.setAttribute('cy', (y + btnRow1Offset).toString());
    view.addTxt0.setAttribute('x', (x + addC1Xoffset).toString());
    view.addTxt0.setAttribute('y', (y + 34).toString());
    view.addTxt0.textContent = prize.tickets.partList[1];
//First part text
    view.part1.setAttribute('x', (x + partC1Xoffset).toString());
    view.part1.setAttribute('y', (y + 35).toString());
    view.part1.textContent = prize.tickets.partList[0];
//First part remove btn
    view.btnMinus0.setAttribute('cx', (x + minusC1Xoffset).toString());
    view.btnMinus0.setAttribute('cy', (y + btnRow1Offset).toString());

    view.btnAdd2.setAttribute('cx', (x + addC2Xoffset).toString());
    view.btnAdd2.setAttribute('cy', (y + btnRow1Offset).toString());
    view.addTxt2.setAttribute('x', (x + addC2Xoffset).toString());
    view.addTxt2.setAttribute('y', (y + 34).toString());
    view.addTxt2.textContent = prize.tickets.partList[3];
    view.part2.setAttribute('x', (x + partC2Xoffset).toString());
    view.part2.setAttribute('y', (y + 35).toString());
    view.part2.textContent = prize.tickets.partList[2];
    view.btnMinus2.setAttribute('cx', (x + minusC2Xoffset).toString());
    view.btnMinus2.setAttribute('cy', (y + btnRow1Offset).toString());

    view.btnAdd4.setAttribute('cx', (x + addC1Xoffset).toString());
    view.btnAdd4.setAttribute('cy', (y + 45).toString());
    view.addTxt4.setAttribute('x', (x + addC1Xoffset).toString());
    view.addTxt4.setAttribute('y', (y + 47).toString());
    view.addTxt4.textContent = prize.tickets.partList[5];
    view.part3.setAttribute('x', (x + partC1Xoffset).toString());
    view.part3.setAttribute('y', (y + 48).toString());
    view.part3.textContent = prize.tickets.partList[4];
    view.btnMinus4.setAttribute('cx', (x + minusC1Xoffset).toString());
    view.btnMinus4.setAttribute('cy', (y + 45).toString());

    view.btnAdd6.setAttribute('cx', (x + addC2Xoffset).toString());
    view.btnAdd6.setAttribute('cy', (y + 45).toString());
    view.addTxt6.setAttribute('x', (x + addC2Xoffset).toString());
    view.addTxt6.setAttribute('y', (y + 47).toString());
    view.addTxt6.textContent = prize.tickets.partList[7];
    view.part4.setAttribute('x', (x + partC2Xoffset).toString());
    view.part4.setAttribute('y', (y + 48).toString());
    view.part4.textContent = prize.tickets.partList[6];
    view.btnMinus6.setAttribute('cx', (x + minusC2Xoffset).toString());
    view.btnMinus6.setAttribute('cy', (y + 45).toString());

    if (prize.tickets.partList[8]) {
      view.btnAdd8.setAttribute('cx', (x + addC1Xoffset).toString());
      view.btnAdd8.setAttribute('cy', (y + 58).toString());
      view.addTxt8.setAttribute('x', (x + addC1Xoffset).toString());
      view.addTxt8.setAttribute('y', (y + 60).toString());
      view.addTxt8.textContent = prize.tickets.partList[9];
      view.part5.setAttribute('x', (x + partC1Xoffset).toString());
      view.part5.setAttribute('y', (y + 61).toString());
      view.part5.textContent = prize.tickets.partList[8];
      view.btnMinus8.setAttribute('cx', (x + minusC1Xoffset).toString());
      view.btnMinus8.setAttribute('cy', (y + 58).toString());
      if (prize.tickets.partList[10]) {
        view.btnAdd10.setAttribute('cx', (x + addC2Xoffset).toString());
        view.btnAdd10.setAttribute('cy', (y + 58).toString());
        view.addTxt10.setAttribute('x', (x + addC2Xoffset).toString());
        view.addTxt10.setAttribute('y', (y + 60).toString());
        view.addTxt10.textContent = prize.tickets.partList[11];
        view.part6.setAttribute('x', (x + partC2Xoffset).toString());
        view.part6.setAttribute('y', (y + 61).toString());
        view.part6.textContent = prize.tickets.partList[10];
        view.btnMinus10.setAttribute('cx', (x + minusC2Xoffset).toString());
        view.btnMinus10.setAttribute('cy', (y + 58).toString());
        if (prize.tickets.partList[12]) {
          view.btnAdd12.setAttribute('cx', (x + addC1Xoffset).toString());
          view.btnAdd12.setAttribute('cy', (y + 71).toString());
          view.addTxt12.setAttribute('x', (x + addC1Xoffset).toString());
          view.addTxt12.setAttribute('y', (y + 73).toString());
          view.addTxt12.textContent = prize.tickets.partList[13];
          view.part7.setAttribute('x', (x + partC1Xoffset).toString());
          view.part7.setAttribute('y', (y + 74).toString());
          view.part7.textContent = prize.tickets.partList[12];
          view.btnMinus12.setAttribute('cx', (x + minusC1Xoffset).toString());
          view.btnMinus12.setAttribute('cy', (y + 71).toString());
          if (prize.tickets.partList[14]) {
            view.btnAdd14.setAttribute('cx', (x + addC2Xoffset).toString());
            view.btnAdd14.setAttribute('cy', (y + 71).toString());
            view.addTxt14.setAttribute('x', (x + addC2Xoffset).toString());
            view.addTxt14.setAttribute('y', (y + 73).toString());
            view.addTxt14.textContent = prize.tickets.partList[15];
            view.part8.setAttribute('x', (x + partC2Xoffset).toString());
            view.part8.setAttribute('y', (y + 74).toString());
            view.part8.textContent = prize.tickets.partList[14];
            view.btnMinus14.setAttribute('cx', (x + minusC2Xoffset).toString());
            view.btnMinus14.setAttribute('cy', (y + 71).toString());
          }
        }
      }
    }
  };
  view.toggle = (el) => {
    const elem = document.getElementById(el);
    elem.classList.contains('hide') ?  elem.classList.remove('hide') : elem.classList.add('hide');
  };
  view.toggleTokenRequestView = () => {
    view.toggle('emailOrPhone');
    view.toggle('btnSendTokenRequest');
  };
  view.toggleLoginView =() => view.toggle('btnLogin');
  view.toggleCredentialView = () => {
    view.toggleTokenRequestView();
    view.toggleLoginView();
  };
};
view.spInfo = document.getElementById('spInfo');
view.setSpView = (el, cls, txt) => {
  el.innerText = txt;
  const clsList = el.classList;
  clsList.add(cls);
  if(cls === 'error') {
    clsList.remove('info');
    clsList.remove('warn');
  }
  if(cls === 'warn') {
    clsList.remove('info');
    clsList.remove('error');
  }
  if(cls === 'info') {
    clsList.remove('error');
    clsList.remove('warn');
  }
};
acquireLargeCardView(view);
defineViewFunctions(view);
store.setPrizeDataToDefault = (url, cb) => {
  const ajaxReq = new XMLHttpRequest();
  ajaxReq.addEventListener('load', function () {
    console.log('status',ajaxReq.status);
    if (ajaxReq.status === 200) cb(null, ajaxReq.responseText);
    else cb(ajaxReq.responseText, null);
  });
  ajaxReq.addEventListener('error', function (data) {
    cb({XMLHttpRequestError: 'A fatal error occurred, see console for more information'}, null);
  });
  ajaxReq.open('GET', url, true);
  ajaxReq.send();
};
store.incrementTicketPartQuantity = (ticketIdx, ticket, value) => {
  let partList = prizeData[ticketIdx].tickets.partList;
  partList[partList.indexOf(ticket) + 1] += value;
};
//add all svg event handlers
view.svgRoot.addEventListener('click', function (e) {
  try {
    switch (e.target.id) {
      case 'btnAdd0':
        adjustTicketQuantity(view.addTxt0, 1, 1);
        break;
      case 'btnAdd2':
        adjustTicketQuantity(view.addTxt2, 3, 1);
        break;
      case 'btnAdd4':
        adjustTicketQuantity(view.addTxt4, 5, 1);
        break;
      case 'btnAdd6':
        adjustTicketQuantity(view.addTxt6, 7, 1);
        break;
      case 'btnAdd8':
        adjustTicketQuantity(view.addTxt8, 9, 1);
        break;
      case 'btnAdd10':
        adjustTicketQuantity(view.addTxt10, 11, 1);
        break;
      case 'btnAdd12':
        adjustTicketQuantity(view.addTxt12, 13, 1);
        break;
      case 'btnAdd14':
        adjustTicketQuantity(view.addTxt14, 15, 1);
        break;
      case 'btnMinus0':
        adjustTicketQuantity(view.addTxt0, 1, -1);
        break;
      case 'btnMinus2':
        adjustTicketQuantity(view.addTxt2, 3, -1);
        break;
      case 'btnMinus4':
        adjustTicketQuantity(view.addTxt4, 5, -1);
        break;
      case 'btnMinus6':
        adjustTicketQuantity(view.addTxt6, 7, -1);
        break;
      case 'btnMinus8':
        adjustTicketQuantity(view.addTxt8, 9, -1);
        break;
      case 'btnMinus10':
        adjustTicketQuantity(view.addTxt10, 11, -1);
        break;
      case 'btnMinus12':
        adjustTicketQuantity(view.addTxt12, 13, -1);
        break;
      case 'btnMinus14':
        adjustTicketQuantity(view.addTxt14, 15, -1);
        break;
      case 'largeCardClose':
        reset(e);
        break;
      case 'btnMenu':
          //future feature
        break;
      default:
        view.cardSelected(e.target);
        break;
    }
  }
  catch (e) {
    console.log(e);
  }
});
function reset(e) {
  document.getElementById('w' + e.target.attributes[5].value).classList.remove('less');
  view.largeCardSubTitle.setAttribute('x', '500');
  view.largeCardClose.setAttribute('cx', '500');
  view.btnAdd0.setAttribute('cx', '500');
  view.btnAdd2.setAttribute('cx', '500');
  view.btnAdd4.setAttribute('cx', '500');
  view.btnAdd6.setAttribute('cx', '500');
  view.btnAdd8.setAttribute('cx', '500');
  view.btnAdd10.setAttribute('cx', '500');
  view.btnAdd12.setAttribute('cx', '500');
  view.btnAdd14.setAttribute('cx', '500');
  view.largeCardClose.setAttribute('cx', '500');
  view.btnMinus0.setAttribute('cx', '500');
  view.btnMinus2.setAttribute('cx', '500');
  view.btnMinus4.setAttribute('cx', '500');
  view.btnMinus6.setAttribute('cx', '500');
  view.btnMinus8.setAttribute('cx', '500');
  view.btnMinus10.setAttribute('cx', '500');
  view.btnMinus12.setAttribute('cx', '500');
  view.btnMinus14.setAttribute('cx', '500');
  view.part1.setAttribute('x', '-500');
  view.part2.setAttribute('x', '-500');
  view.part3.setAttribute('x', '-500');
  view.part4.setAttribute('x', '-500');
  view.part5.setAttribute('x', '-500');
  view.part6.setAttribute('x', '-500');
  view.part7.setAttribute('x', '-500');
  view.part8.setAttribute('x', '-500');
  view.addTxt0.setAttribute('x', '500');
  view.addTxt2.setAttribute('x', '500');
  view.addTxt4.setAttribute('x', '500');
  view.addTxt6.setAttribute('x', '500');
  view.addTxt8.setAttribute('x', '500');
  view.addTxt10.setAttribute('x', '500');
  view.addTxt12.setAttribute('x', '500');
  view.addTxt14.setAttribute('x', '500');
  view.svgRoot.setAttribute('viewBox', '-400 -300 800 690');
  if (prizeChanged(store.current.prize.tickets.partList)) {
    store.updatePrize(store.current.prize, store.current.prizeIndex);
  }
}
function adjustTicketQuantity(addBtn, qidx, q) {
  store.current.prize.tickets.partList[qidx] = store.current.prize.tickets.partList[qidx] + q;
  if (store.current.prize.tickets.partList[qidx] < 0) store.current.prize.tickets.partList[qidx] = 0;
  addBtn.textContent = store.current.prize.tickets.partList[qidx];
}
store.updatePrize = (prize, prizeIdx) => {
  if (!prize.tickets.winner) {
    let ticket = checkForRareTicket(prize);
    if (ticket) {
      prize.tickets.winner = ticket;
    }
  }
  if(store.authorized === 'yes'){
    view.setSpView(view.spInfo,'info',`Updating Remote Data for ${prize.name}`);
    ajaxPostJson(updateUserDataResource, {prizeIdx: prizeIdx, prize: prize}, function (err, data) {
        if(data.errorMessage) {
          view.setSpView(view.spInfo, 'warn', `Your session has ended, login to store changes on remote`);
          localStorage.setItem('authorized', 'expired');
          store.authorized = 'expired';
          view.toggle('btnLogin');
        }
        else{
          if(data === true){
            view.setSpView(view.spInfo, 'info', `${prize.name} updated`);
          }
        }
    }, localStorage.getItem('token'));
  }
  else{
    view.setSpView(view.spInfo, 'error', `${prize.name} updated locally only, remote will overwrite`);
  }
  store.updateLocalPrizeData(prize, prizeIdx);
};

function prizeChanged(partList) {
  //prize changed if any partList quantities changed or if winner field changed, but I think that a quantity has to change for the winner field to change anyway
  let c = 0;
  for (c; c < partList.length; c++) {
    if (partList[c] !== prizeData[store.current.prizeIndex].tickets.partList[c]) return true;
  }
  return (store.current.prize.tickets.winner !== prizeData[store.current.prizeIndex].tickets.winner);
}
store.setCurrentPrize = (prize) => {
  return {
    name: prize.name,
    value: prize.value,
    available: prize.available,
    tickets: {
      "required": prize.tickets.required,
      partList: prize.tickets.partList.map(item => item),
      winner: prize.tickets.winner
    },
    startAvailable: prize.startAvailable,
    viewId: prize.viewId
  };
};
/**
 * Takes a prize object and stores tickets with zero quantities into an array, then checks the length of the array. If the length of the array is equal to one, then it returns that ticket as the winning ticket, else it returns ''
 * @param {Object} prize
 * @param {[]} prize.tickets.partList - Of the form [ticketID, quantity,...] for each ticket required to win the prize
 * @returns {string} winning - ticket id or '' if no winner identified
 */
function checkForRareTicket(prize) {
  var ticket = [];
  var len = prize.tickets.partList.length, c = 1;
  for (c; c < len; c += 2) {
    if (prize.tickets.partList[c] === 0) ticket.push(prize.tickets.partList[c - 1]);
  }
  if (ticket.length === 1) return ticket[0];
  return "";
}
/**
 *
 * @param value
 */
function ticketInput(value) {
  let ticket = value || document.getElementById('ticket').value.toUpperCase();

  const ticketsAry = prizeData.map(prize => prize.tickets);
  const arrayOfPartsArrays = ticketsAry.map(ticket => ticket.partList);
  const ticketIdx = getTicketIdx(value, arrayOfPartsArrays);
  //winner equal to the prizeData[n].tickets object that contains value as the winner property. If no winner property is equal to value, winner is undefined
  const winner = isAWinningTicket(value, ticketsAry);

  if (ticketIdx < 0) {
    addTicketMessage(false, ticket);
  }
  else {
    const prize = prizeData[ticketIdx];
    if (winner) youWin(prize.viewId);
    else addTicketMessage(prize.viewId, ticket, prize.tickets.partList[prize.tickets.partList.indexOf(ticket) + 1] + 1, prize);
    store.incrementTicketPartQuantity(ticketIdx, ticket, 1);
    store.updatePrize(prize, ticketIdx);
  }
}
function youWin(viewId) {
  const elId = 'w' + viewId.substr(1);
  const el = document.getElementById(elId);
  el.textContent = 'WINNER!';
  el.classList.add('winner');
  el.classList.remove('winnerTxt');
}
function addTicketMessage(viewId, ticket, value, prize) {
  if (!(viewId)) {
    alert('Game piece not found: ' + ticket);
  }
  else {
    if (view.current.prize && !Object.is(view.current.prize, prize)) view.setWinningTicketOnPrizeCard(view.current.prize);
    view.setCurrent('prize', prize);
    document.getElementById(`w${prize.viewId.substr(1)}`).textContent = `${ticket} = ${value}`;
  }
  document.getElementById('ticket').value = '';
}
document.getElementById('btnEnter').addEventListener('click', function () {
  ticketInput(document.getElementById('ticket').value.toUpperCase());
});
document.getElementById('ticket').addEventListener('keyup', function (e) {
  if (e.keyCode === 13) {
    ticketInput(e.target.value.toUpperCase());
    e.target.value = '';
  }
});
document.getElementById('ticket').focus();
document.getElementById('btnLogin').addEventListener('click', () => {
  if(!(loggedIn)) logIn();
});
document.getElementById('btnSendTokenRequest').addEventListener('click', () => {
  requestToken(document.getElementById('emailOrPhone').value, (err, data) => {
    console.dir(data);
  });
});
const requestToken = (emailOrPhone, cb) => {
  view.setSpView(view.spInfo,'info','Click the link in your email to work with your account');
  view.toggleCredentialView();
  const data = {email: emailOrPhone};
  ajaxPostJson(loginResource, data, (err, resData) => {
    cb(`'requestTokenResponse:', ${resData}`);
  });
  view.toggle('btnLogin');
};
const logIn = () => {
  view.toggleCredentialView();
  document.getElementById('emailOrPhone').focus();
};
const issueToken = (hash) => {
  ajaxPostJson(authorizationResource,{hash: hash}, (err, resData) => {
    if(err) console.error(err);
    localStorage.setItem('authorized','yes');
    store.authorized = 'yes';
    window.localStorage.setItem('token',resData);
    window.location.hash = '';
    getUserData();
  });
};
if(window.location.hash){
  issueToken(window.location.hash.slice(1));
}
const getUserData = () => {
  view.setSpView(view.spInfo, 'info', 'Downloading prize data');
  ajaxPostJson(userDataResource,{'doesnot':'matter'}, (err, data) => {
    if(err) {
      console.error(err);
      view.setSpView(view.spInfo, 'warn', 'Connection to remote data failed. Check Internet connection');
      const cacheData = window.localStorage.getItem('prizeData');
      if(cacheData){
        prizeData = JSON.parse(cacheData);
        configureCardCollectionView(prizeData);
      }
      else{
        view.setSpView(view.spInfo, 'error', 'No Local Data Found, Connect to Internet to retrieve prize data');
      }
      return;
    }
    if(data.errorMessage){
      const cacheData = window.localStorage.getItem('prizeData');
        if(cacheData){
          prizeData = JSON.parse(cacheData);
          configureCardCollectionView(prizeData);
          view.setSpView(view.spInfo, 'warn', 'Your session has ended. Data will only store locally until logged in. Offline synchronization coming soon.');
          window.localStorage.setItem('authorized', 'expired');
          view.toggle('btnLogin');
        }
    }
    else{
      prizeData = data;
      window.localStorage.setItem('authorized', 'yes');
      window.localStorage.setItem('prizeData', JSON.stringify(data));
      view.setSpView(view.spInfo,'info','Local data updated to by remote');
    }
    configureCardCollectionView(prizeData);
  }, window.localStorage.getItem('token'));
};
const start = () => {
  if(store.authorized === 'yes'){
    view.spInfo.classList.add('loggedIn');
    getUserData();
  }
  else{
    view.spInfo.classList.remove('loggedIn');
    if(store.authorized === 'expired'){
      view.setSpView(view.spInfo, 'warn', 'Your session has expired, Login to save changes on remote host.');
      const cacheData = window.localStorage.getItem('prizeData');
      if(cacheData){
        prizeData = JSON.parse(cacheData);
      }
      else{
        view.setSpView(view.spInfo, 'error', 'No local Data, Login to download data');
        view.toggle('btnLogin');
      }
      view.toggle('btnLogin');
    }
    else{//Has no account
      view.toggle('btnLogin');
      const cacheData = window.localStorage.getItem('prizeData');
      if(cacheData){
        prizeData = JSON.parse(cacheData);
      }
      else{
        store.setPrizeDataToDefault(remoteDataUrl, function (err, data) {
          view.setSpView(view.spInfo, 'info', 'Initializing Prize Data');
          if (err) {
            view.setSpView(view.spInfo, 'error', 'There was a problem initializing prize Data!, check Internet Connection.');
            return;
          }
          prizeData = JSON.parse(data);
          window.localStorage.setItem('prizeData', data);
          configureCardCollectionView(prizeData);
          view.setSpView(view.spInfo, 'info', 'Initial Prize Data Loaded');
        });
      }
      configureCardCollectionView(prizeData);
    }
    configureCardCollectionView(prizeData);
  }
};
store.updateLocalPrizeData = (prize, prizeIdx) => {
  prizeData[prizeIdx] = prize;
  window.localStorage.setItem('prizeData', JSON.stringify(prizeData));
  configureCardCollectionView(prizeData);
};
const isAWinningTicket = (ticketId, ticketAry) => {
  return ticketAry.find((prizeTicket) => prizeTicket.winner === ticketId);
};
const getTicketIdx = (ticketId, aryOfPartsAry) => {
  let gridRow = grids.getRowStrings(grids.getGridRowByColumnData(aryOfPartsAry, ticketId));
  let grid = aryOfPartsAry.map(row => grids.getRowStrings(row));
  return grids.getRowIdxFromRow(grid, gridRow, 0);
};
start();