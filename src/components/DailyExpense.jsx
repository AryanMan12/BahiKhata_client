import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import styled from 'styled-components';

function DailyExpense() {
    let today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    const todays_date = yyyy + '-' + mm + '-' + dd;

    let [itemList, setitemList] = useState([]);
    let [priceList, setpriceList] = useState([]);

    let [balitemList, setbalitemList] = useState([]);
    let [balpriceList, setbalpriceList] = useState([]);
    let [balance, setbalance] = useState(0);
    let [balLeft, setbalLeft] = useState(0);
    let [totalBal, settotalBal] = useState(0);
    let [isPrev, setisPrev] = useState(false);

    let [itemName, setitemName] = useState("");
    let [itemCost, setitemCost] = useState(0);
    let [date, setdate] = useState(todays_date);
    
    let [singleItemCost, setsingleItemCost] = useState(0);
    
    let [remaining, setremaining] = useState("");
    let [exp, setexp] = useState("");
    let [grandTotal, setgrandTotal] = useState("");

    useEffect(()=>{
        Axios.get(`http://localhost:3001/api/daily/${date}`).then((response)=>{
            console.log("Date change data fetched!!");
            console.log(response);
            if (response.data.length === 0){
                Axios.post(`http://localhost:3001/api/setDaily/`, {date:date}).then(()=>{console.log("sucess")});
                setitemList([]);
                setpriceList([]);
                setbalitemList([]);
                setbalpriceList([]);
                setremaining(0);
                setexp(0);
                setgrandTotal(0);
            }else{
                setitemList(JSON.parse(response.data[0].items_list));
                setpriceList(JSON.parse(response.data[0].items_prices));
                setbalitemList(JSON.parse(response.data[0].bal_item_list));
                setbalpriceList(JSON.parse(response.data[0].bal_price_list));
                setbalance(response.data[0].balance);
                setbalLeft(response.data[0].bal_left);
                settotalBal(response.data[0].total_bal);
                setremaining(response.data[0].total_remaining);
                setexp(response.data[0].total_exp);
                setgrandTotal(response.data[0].grand_total);
            }
            const buttons = document.getElementsByClassName("changeDate");
            for (let i = 0; i < buttons.length; i++){
                buttons[i].disabled = false;
            }
        });
    }, [date]);

    const enterData = () =>{
        if(isPrev){
            Axios.put("http://localhost:3001/api/updateBalItem/", {items:[...balitemList, itemName, ], costs:[...balpriceList, itemCost, ], date:date, bal_left:balLeft-itemCost, bal_total:parseInt(remaining)+balLeft-itemCost}).then(()=>{console.log("success")});
            setbalitemList([...balitemList, itemName]);
            setbalpriceList([...balpriceList, itemCost]);
            setbalLeft(balLeft-itemCost);
            settotalBal(parseInt(remaining)+balLeft-itemCost);
            setitemCost(0);
            setitemName("");
        }else{
            Axios.put("http://localhost:3001/api/updateItem/", {items:[...itemList, itemName, ], costs:[...priceList, itemCost, ], date:date, remaining:remaining, exp:parseInt(exp)+parseInt(itemCost), grandTotal:parseInt(remaining)+parseInt(exp)+parseInt(itemCost)}).then(()=>{console.log("success")});
            setitemList([...itemList, itemName]);
            setpriceList([...priceList, itemCost]);
            setexp(parseInt(exp)+parseInt(itemCost));
            setgrandTotal(parseInt(remaining)+parseInt(exp)+parseInt(itemCost));
            setitemCost(0);
            setitemName("");
        }
    }

    const onRemainingChange = () =>{
        Axios.put("http://localhost:3001/api/updateItem/", {items:itemList, costs:priceList, date:date, remaining:remaining, exp:parseInt(exp), grandTotal:parseInt(remaining)+parseInt(exp)}).then(()=>{console.log("success")});
        Axios.put("http://localhost:3001/api/updateBalItem/", {items:balitemList, costs:balpriceList, date:date, bal_left:balLeft, bal_total:parseInt(remaining)+balLeft}).then(()=>{console.log("success")});
        setgrandTotal(parseInt(remaining)+parseInt(exp));
        settotalBal(parseInt(remaining)+balLeft);
    }

    const onSave = (index) =>{
        const prevCost = priceList[index];
        setpriceList(priceList[index] = singleItemCost);
        Axios.put("http://localhost:3001/api/updateSingleItem/", {items:itemList, costs:priceList, date:date, exp:parseInt(exp)+parseInt(singleItemCost)-parseInt(prevCost), grandTotal:parseInt(remaining)+parseInt(exp)+parseInt(singleItemCost)-parseInt(prevCost)}).then(()=>{console.log("success")});
    }

    const onDelete = (index) =>{
        const prevCost = priceList[index];
        setpriceList(priceList.splice(index, 1));
        setitemList(itemList.splice(index, 1));
        Axios.put("http://localhost:3001/api/updateSingleItem/", {items:itemList, costs:priceList, date:date, exp:parseInt(exp)-parseInt(prevCost), grandTotal:parseInt(remaining)+parseInt(exp)-parseInt(prevCost)}).then(()=>{console.log("success")});
    }

    const onDateChange = (event,num) =>{
        const buttons = document.getElementsByClassName("changeDate");
        for (let i = 0; i < buttons.length; i++){
            buttons[i].disabled = true;
        }
        let dd = parseInt(String(date).slice(8, 10))+num;
        let mm = parseInt(String(date).slice(5, 7));
        let yy = parseInt(String(date).slice(0,4));
        let new_date = "";
        if(dd === 0){
            mm = String((mm-2)%12).padStart(2, '0');
            console.log()
            if (["00","02","04","06","07","09","11"].includes(mm)){
                dd = 31;
            }else if (["03","05","08","10"].includes(mm)){
                dd = 30;
            }else if (mm === "01"){
                if (parseInt(String(date).slice(0,4))%4 === 0){
                    dd = 29;
                }else{
                    dd = 28;
                }
            }else if (mm === "11"){
                yy = yy-1;
            }
            mm = parseInt(mm)+1;
            new_date = `${yy}-${mm}-`+String(dd).padStart(2, '0');
        }else if(dd === 32){
            mm = String((mm+1)%12).padStart(2, '0');
            if (mm === "01"){
                yy = yy+1;
            }
            dd = 1;
            new_date = `${yy}-${mm}-`+String(dd).padStart(2, '0');
        }else if((dd === 31 && ["04","06","09","11"].includes(mm)) || (dd === 30 && mm === "2") || (dd===29 && mm === "2" && !(parseInt(String(date).slice(0,4))%4 === 0))){
            mm = String((mm+1)%12).padStart(2, '0');
            dd = 1;
            new_date = `${yy}-${mm}-`+String(dd).padStart(2, '0');
        }
        else{
            new_date = String(date).slice(0, 8)+String(dd).padStart(2, '0');
        }
        setdate(new_date);
        
    }

    const onBalSave = (index) =>{
        const prevCost = balpriceList[index];
        setbalpriceList(balpriceList[index] = singleItemCost);
        Axios.put("http://localhost:3001/api/updateSingleBalItem/", {items:balitemList, costs:balpriceList, date:date, bal_left:balLeft-parseInt(singleItemCost)+parseInt(prevCost), bal_total:parseInt(remaining)+balLeft-parseInt(singleItemCost)+parseInt(prevCost)}).then(()=>{console.log("success")});
    
    }

    const onBalDelete = (index) =>{
        const prevCost = balpriceList[index];
        setbalpriceList(balpriceList.splice(index, 1));
        setbalitemList(balitemList.splice(index, 1));
        Axios.put("http://localhost:3001/api/updateSingleBalItem/", {items:balitemList, costs:balpriceList, date:date, bal_left:balLeft+parseInt(prevCost), bal_total:parseInt(remaining)+balLeft+parseInt(prevCost)}).then(()=>{console.log("success")});
    }

    return (
        <Main>
            <PageHead>
                    <ChangeDate className='changeDate' onClick={(e) => onDateChange(e,-1)}> {"<"} </ChangeDate>
                    Date <input type="date" value={date} onChange={(e)=> setdate(e.target.value)}/>
                    <ChangeDate className='changeDate' onClick={(e) => onDateChange(e,1)}> {">"} </ChangeDate>

            </PageHead>
            <Datas>
                <PreviousCol>
                    Balance: {balance}
                    <BalItemsList>
                        {balitemList.map((val, i)=> {
                        return <Container key={i}>
                            <NameLabel>{balitemList[i]} </NameLabel>
                            <SingleItemInputBox type="text" defaultValue={balpriceList[i]} onChange={(e)=>setsingleItemCost(e.target.value)}/> 
                            <SaveButton onClick={()=>onBalSave(i)}>Save</SaveButton>
                            <DeleteButton onClick={()=>onBalDelete(i)}>Delete</DeleteButton>
                        </Container>
                        }
                        )}
                    </BalItemsList>
                    <TotalDiv>
                        Total
                        <TotalLabel>Balance Left: {balLeft}</TotalLabel>
                        <TotalLabel>Remaining: {remaining}</TotalLabel>
                        <TotalLabel>Total: {totalBal}</TotalLabel>
                    </TotalDiv>
                </PreviousCol>
                <TodaysCol>
                    <TodayLabel>Today</TodayLabel>
                    <ItemsList>
                        {itemList.map((val, i)=> {
                        return <Container key={i}>
                            <NameLabel>{itemList[i]} </NameLabel> 
                            <SingleItemInputBox type="text" defaultValue={priceList[i]} onChange={(e)=>setsingleItemCost(e.target.value)}/> 
                            <SaveButton onClick={()=>onSave(i)}>Save</SaveButton> 
                            <DeleteButton onClick={()=>onDelete(i)}>Delete</DeleteButton>
                        </Container>
                        }
                        )}
                    </ItemsList>
                    <TotalDiv>
                        Total
                        <TotalLabel>Total Expense: {exp}</TotalLabel>
                        <span style={{fontSize: "20px", fontWeight: 500}}>
                            Remaining:<Remaining value={remaining} onChange={(e)=> setremaining(e.target.value)}/>
                            <UpdateRemaining onClick={onRemainingChange}>Update</UpdateRemaining>
                        </span>
                        <TotalLabel>Total: {grandTotal}</TotalLabel>
                    </TotalDiv>
                </TodaysCol>
            </Datas>
            <Inputs>
                <CheckboxCss type="checkbox" checked={isPrev} onChange={(e) => setisPrev(e.target.checked)}/> From Balance
                <InputBox type="text" placeholder='Item' autoComplete='on' value={itemName} onChange={(e)=>setitemName(e.target.value)}/>
                <InputBox type="text" placeholder='Cost' autoComplete='on' value={itemCost} onChange={(e)=>setitemCost(e.target.value)}/>
                <EnterButton onClick={enterData}>Enter</EnterButton>
            </Inputs>
        </Main>
    );
  }
  
export default DailyExpense;


// Styling
// Main(Overall) Div
const Main = styled.div`
    height: 95vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
`;

// Header Div
const PageHead = styled.div`
    color: black;
    font-size: 24px;
`;

const ChangeDate = styled.button`
    margin: 0px 10px;
    font-size: 20px;
    font-weight: 700;
    height: 30px;
    width: 30px;
`;

// Prev and Todays Parent Div
const Datas = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    width: 100%;
    color: black;
    font-size: 24px;
`;

// Previous Column CSS
const PreviousCol = styled.div`
    height: 75vh;
    width: 520px;
    color: black;
    font-weight: bold;
    font-size: 26px;
`;

const BalItemsList = styled.div`
    height: 35vh;
    width: 475px;
    color: black;
    font-size: 26px;
    font-weight: bold;
    overflow-y: scroll;
`;

// Todays Column CSS
const TodaysCol = styled.div`
    height: 75vh;
    width: 520px;
    color: black;
    font-size: 26px;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;
const TodayLabel = styled.div`
    color: black;
    font-size: 24px;
    margin: 10px 0px;
`;

const ItemsList = styled.div`
    height: 55vh;
    width: 475px;
    color: black;
    font-size: 26px;
    font-weight: bold;
    overflow-y: scroll;
`;

// Total Calculation Div
const TotalDiv = styled.div`
    font-size: 24px;
    margin: 0px 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const TotalLabel = styled.div`
    color: black;
    font-size: 20px;
    font-weight: 500;
    margin: 2px 0px;
`;

const Remaining = styled.input`
    height: 24px;
    width: 150px;
    font-size: 16px;
    margin: 0px 10px;
`;

const UpdateRemaining = styled.button`
    height: 24px;
    width: 75px;
    font-size: 16px;
    margin: 0px 10px;
`;

// Main Input CSS
const Inputs = styled.div`
    color: black;
    font-size: 20px;
`;

const CheckboxCss = styled.input`
    height: 20px;
    width: 20px;
    font-size: 18px;
    margin: 0px 10px;
`;

const InputBox = styled.input`
    height: 5vh;
    width: 400px;
    font-size: 18px;
    margin: 0px 10px;
`;

const EnterButton = styled.button`
    height: 6vh;
    width: 150px;
    font-size: 20px;
    margin: 0px 10px;
`;



// Single Rows CSS
const Container = styled.div`
    display: grid;
    grid-template-columns: 2fr 2fr 1fr 1fr;
    align-items: center;
    border-top: 1px solid black;
    margin: 2px 5px;
    font-weight: 500;
    grid-column-gap: 5px;
`;
const NameLabel = styled.label`
    font-size: 20px;
    margin: 5px 15px;
    `;
const SingleItemInputBox = styled.input`
    width: 100px;
    height: 20px;
    font-size: 15px;
    margin: 5px 15px;
    border-radius: 8px;
    `;
const SaveButton = styled.button`
    background-color: greenyellow;
    margin: 5px 15px;
    border: none;
    border-radius: 7px;
    height: 25px;
    width: 50px;
    :hover{
        background-color: rgb(25, 255 ,50);
        width: 52px;
        height: 27px;
    }
`;
const DeleteButton = styled.button`
    background-color: rgb(255, 100, 100);
    margin: 5px 15px;
    border: none;
    border-radius: 7px;
    height: 25px;
    width: 50px;
    :hover{
        background-color: rgb(255, 0, 0);
        width: 52px;
        height: 27px;
    }
`;