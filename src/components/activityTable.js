import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {getMainnetTransfers, getxDaiTransfers, POAP_API_URL} from "../store/api";


dayjs.extend(relativeTime)


export default function ActivityTable() {

  const [loading, setLoading] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [daitransfers, setDaiTransfers] = useState([])
  const [mainnetTransfers, setMainnetTransfers] = useState([])

  useEffect(() => {
      setLoading(true)
    getMainnetTransfers(2)
        .then(
          (result) => {
            let tfrs = result.data.transfers
            tfrs.map(t => t.network = "mainnet")
            setMainnetTransfers(tfrs)
            setLoading(false)
          },
          (error) => {
            setLoading(false)
            console.log('failed to query the graph',error)
          },
        );
  }, []);

  useEffect(() => {
      setLoading(true)
      getxDaiTransfers(2)
        .then(
          (result) => {
            let tfrs = result.data.transfers
            tfrs.map(t => t.network = "xDai")
            setDaiTransfers(tfrs)
            setLoading(false)
          },
          (error) => {
            setLoading(false)
            console.log('failed to query the graph',error)
          },
        );
  }, []);

  useEffect(() => {
    let tfrs = daitransfers.concat(mainnetTransfers)
    tfrs.sort((a, b) => {
      return b.timestamp - a.timestamp
    })

    setTransfers(tfrs.slice(0, 2))
  }, [daitransfers, mainnetTransfers])

  return (
        <div className="feed" style={{display: "flex", flexDirection : "column" , justifyContent: "center", fontSize: '.89rem'}}>
          <div style={{margin: '0 auto'}}>
            <Transfers loading={loading} transfers={transfers} ></Transfers>
          </div>
          <div style={{display: "flex" , justifyContent: "center", margin: '.5rem 0'}}> <Link to="/activity">Recent Activity</Link> </div>
        </div>
  )
}

function Claim({transfer}) {
  return (
    <div style={{margin: '.8rem 0'}}>
      <span>Token </span>
      <a style={{width: '1.3rem'}} href={"https://app.poap.xyz/token/"+transfer.token.id}>
      <img style={{
       width: "1.3rem",
       height: '1.3rem',
       borderRadius: '50%'
      }} src={`${POAP_API_URL}/token/${transfer.token.id}/image`} alt=""/>
   </a>
      <span> was claimed by <a href={"https://app.poap.xyz/scan/" + transfer.to.id}> {transfer.to.id.substring(0,16)+ '…'} </a> {dayjs(transfer.timestamp * 1000).fromNow()} on {transfer.network} </span>
    </div>
  )
}
function Transfer({transfer}) {
  return (
    <div style={{margin: '.8rem 0'}}>
      <span>Token </span>
    <a style={{width: '1.3rem'}} href={"https://app.poap.xyz/token/"+transfer.token.id}>
      <img style={{
       width: "1.3rem",
       height: '1.3rem',
       borderRadius: '50%'
      }} src={`${POAP_API_URL}/token/${transfer.token.id}/image`} alt=""/>
   </a>
      <span> was transferred from <a href={"https://app.poap.xyz/scan/" + transfer.from.id}> {transfer.from.id.substring(0,16)+ '…'} </a> to <a href={"https://app.poap.xyz/scan/" + transfer.to.id}> {transfer.to.id.substring(0,16)+ '…'} </a> {dayjs(transfer.timestamp * 1000).fromNow()} {transfer.network} </span>
    </div>
  )
}

function Transfers({transfers, loading}) {
  const tfers = []
  for (let i = 0; i < transfers.length; i++) {
    const t = transfers[i];
    if(t.from.id === '0x0000000000000000000000000000000000000000') {
      tfers.push(<Claim key={t.id} transfer={t}></Claim>)
    } else {
      tfers.push(<Transfer key={t.id} transfer={t}></Transfer>)
    }
  }
  return tfers
}
