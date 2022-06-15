import MessageChannel from "./lib/messageChannel"
import Messenger from "./messager"
import EventEmitter from 'eventemitter3'
import {DAppActions} from "./constant"
import {
  BroadcastTransactionResult,
  ConnectInfo,
  ProviderError,
  RequestArguments,
  SendLegacyStakeDelegationArgs,
  SendLegacyPaymentArgs,
  SendTransactionArgs,
  SendTransactionResult,
  SignedData,
  SignMessageArgs,
  VerifyMessageArgs,
} from "./TSTypes"
import {IMinaProvider} from "./IProvider"

export default class MinaProvider extends EventEmitter implements IMinaProvider{
  private readonly channel: MessageChannel
  private readonly messenger: Messenger
  public readonly isAuro: boolean = true
  private connectedFlag: boolean
  
  constructor() {
    super()
    this.channel = new MessageChannel('webhook')
    this.messenger = new Messenger(this.channel)
    this.initEvents()
  }

  public request({method, params}: RequestArguments): Promise<any> {
    return this.messenger.send(method, params)
  }

  public isConnected(): boolean {
    return this.connectedFlag
  }

  public async sendTransaction(args: SendTransactionArgs): Promise<SendTransactionResult>  {
    return this.request({method: DAppActions.mina_sendTransaction, params: args})
  }

  public async signMessage(args: SignMessageArgs): Promise<SignedData> {
    return this.request({method: DAppActions.mina_signMessage, params: args})
  }

  public async verifyMessage(args: VerifyMessageArgs): Promise<boolean>{
    return this.request({method: DAppActions.mina_verifyMessage, params: args})
  }

  public async requestAccounts(): Promise<string[]> {
    return this.request({method: DAppActions.mina_requestAccounts})
  }

  public async requestNetwork(): Promise<'Mainnet' | 'Devnet' | "Berkeley-QA" |'Unhnown'> {
    return this.request({method: DAppActions.mina_requestNetwork})
  }

  public async sendLegacyPayment(args: SendLegacyPaymentArgs): Promise<BroadcastTransactionResult>  {
    return this.request({method: DAppActions.mina_sendPayment, params: args})
  }

  public async sendLegacyStakeDelegation(args: SendLegacyStakeDelegationArgs): Promise<BroadcastTransactionResult> {
    return this.request({method: DAppActions.mina_sendStakeDelegation, params: args})
  }

  private initEvents() {
    this.channel.on('connect', this.onConnect.bind(this))
    this.channel.on('disconnect', this.onDisconnect.bind(this))
    this.channel.on('chainChanged', this.onChainChanged.bind(this))
    this.channel.on('networkChanged', this.onNetworkChanged.bind(this))
    this.channel.on(
      'accountsChanged',
      this.emitAccountsChanged.bind(this)
    )
  }

  private onConnect(): void {
    this.connectedFlag = true
    this.emit('connect')
  }

  private onDisconnect(error: ProviderError): void {
    this.connectedFlag = false
    this.emit('disconnect', error)
  }

  private onChainChanged(chainId: string): void {
    this.emit('chainChanged', chainId)
  }

  private onNetworkChanged(network: string): void {
    this.emit('networkChanged', network)
  }

  private emitAccountsChanged(accounts: string[]): void {
    this.emit('accountsChanged', accounts)
  }
}

