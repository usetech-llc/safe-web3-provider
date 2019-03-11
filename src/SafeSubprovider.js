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
    const signMessageEvent = new window.CustomEvent(
      'EV_SIGN_MESSAGE',
      { detail: payload.params[1] } // In some web3 implementations data is the first parameter, in some it is second
    )
    window.dispatchEvent(signMessageEvent)

    const messageSignedHandler = function (data) {
      window.removeEventListener('EV_MESSAGE_SIGNED', messageSignedHandler)
      if (data.detail) {
        end(null, data.detail)
      } else {
        end(new Error('Something went wrong', null))
      }
    }
    window.addEventListener('EV_MESSAGE_SIGNED', messageSignedHandler)
  }

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
        console.log("Received eth_sign command");
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
