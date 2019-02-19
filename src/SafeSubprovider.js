import uuid from 'uuid/v4'

class SafeSubprovider {
  sendTransaction(payload, end) {
    const id = uuid()
    payload.params[0].id = id
    const showPopupEvent = new window.CustomEvent(
      'EV_SHOW_POPUP_TX',
      { detail: payload.params[0] }
    )
    window.dispatchEvent(showPopupEvent)
    const resolveTransactionHandler = function (data) {
      window.removeEventListener('EV_RESOLVED_TRANSACTION' + data.detail.id, resolveTransactionHandler)
      if (data.detail.hash) {
        end(null, data.detail.hash)
      } else {
        end(new Error('Transaction rejected', data.detail.id))
      }
    }
    window.addEventListener('EV_RESOLVED_TRANSACTION' + id, resolveTransactionHandler)
  }

  signMessage(payload, end) {
    const id = uuid()
    payload.params[0].id = id
    const showPopupEvent = new window.CustomEvent(
      'EV_SHOW_POPUP_SIGN',
      { detail: payload.params[0] }
    )
    window.dispatchEvent(showPopupEvent)

    /*
    const resolveTransactionHandler = function (data) {
      window.removeEventListener('EV_RESOLVED_TRANSACTION' + data.detail.id, resolveTransactionHandler)
      if (data.detail.hash) {
        end(null, data.detail.hash)
      } else {
        end(new Error('Transaction rejected', data.detail.id))
      }
    }
    window.addEventListener('EV_RESOLVED_TRANSACTION' + id, resolveTransactionHandler)
    */
  }

/*
export const generatePairingCodeContent = (privateKey) => {
  const startDate = new Date()
  const expirationDate = new Date(startDate.setMinutes(startDate.getMinutes() + 10))
  const formatedExpirationDate = expirationDate.toISOString().split('.')[0] + '+00:00'

  const data = EthUtil.sha3('GNO' + formatedExpirationDate)
  const vrs = EthUtil.ecsign(data, privateKey)
  const r = new BigNumber(EthUtil.bufferToHex(vrs.r))
  const s = new BigNumber(EthUtil.bufferToHex(vrs.s))
  const pairingCodeContent = JSON.stringify({
    expirationDate: formatedExpirationDate,
    signature: {
      r: r.toString(10),
      s: s.toString(10),
      v: vrs.v
    }
  })
  return pairingCodeContent
}

*/

  handleRequest(payload, next, end) {
    const account = this.engine.currentSafe
    switch (payload.method) {
      case 'eth_accounts':
        end(null, account ? [account] : [])
        return
      case 'eth_coinbase':
        end(null, account)
        return
      case 'eth_sendTransaction':
        this.sendTransaction(payload, end)
        return
      case 'eth_sign':
        this.signMessage(payload, end)
        return
      default:
        next()
    }
  }

  setEngine(engine) {
    this.engine = engine
  }
}

export default SafeSubprovider
