
import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import icons
import '../App.css'; // adjusted path up one level

const StocksTable = ({ userRole, setCurrentPage }) => {
  const [stocks, setStocks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

      // Function to get the user type message
  const getUserTypeMessage = () => {
    if (userRole === 4) { // 4 is the role ID for paid users
      return "You are a Paid user, Thank you";
    } else {
      return "You are a Free user";
    }
  }

  // function to sort the data
  const sortData = (key) => {
    setSortConfig(prevConfig => {
      const isAsc = prevConfig && prevConfig.key === key && prevConfig.direction === 'ascending';
      return { key, direction: isAsc ? 'descending' : 'ascending' };
    });
  };


  const calculatePercentageDifference = (holdPrice, currentPrice) => {
    if (holdPrice && currentPrice) {
      const difference = currentPrice - holdPrice;
      const percentageDifference = (difference / holdPrice) * 100;
      return percentageDifference.toFixed(2); // rounds to 2 decimal places
    }
    return null; // Return 'N/A' or default value
  };


  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch('http://localhost:3000/stocks', { headers });
      let data = await response.json();
  
      if (sortConfig !== null) {
        const sortedData = [...data].sort((a, b) => {
          if (sortConfig.key === 'calculatePercentageDifference') {
            const diffA = calculatePercentageDifference(a.hold_price, a.current_price);
            const diffB = calculatePercentageDifference(b.hold_price, b.current_price);
  
            // Handle null values in sorting
            if (diffA === null && diffB === null) return 0;
            if (diffA === null) return 1; // place 'null' at end
            if (diffB === null) return -1; // place 'null' at end
  
            // numeric comparison
            return (parseFloat(diffA) - parseFloat(diffB)) * (sortConfig.direction === 'ascending' ? 1 : -1);
          }
          
          // convert to numbers if the content is numerical
          const valA = parseFloat(a[sortConfig.key]);
          const valB = parseFloat(b[sortConfig.key]);
  
          // check if comparing two numbers
          if (!isNaN(valA) && !isNaN(valB)) {
            return (valA - valB) * (sortConfig.direction === 'ascending' ? 1 : -1);
          } else {
            // fallback to string comparison
            if (a[sortConfig.key] < b[sortConfig.key]) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
          }
          return 0;
        });
        setStocks(sortedData);
      }
    };
  
    fetchData().catch(console.error);
  }, [userRole, sortConfig]);


  useEffect(() => {
    console.log('SortConfig updated:', sortConfig);
  }, [sortConfig]);


  //render sort icons
  const renderSortIcons = (key) => {
    if (userRole === 4) { //check if user is a paid user
      return (
        <button onClick={() => sortData(key)}>
          {sortConfig.key === key && sortConfig.direction === 'ascending' ? <FaArrowDown /> : <FaArrowUp />}
        </button>
      );
    }
    return null;
  };

  return (
    <div className='table-container'>
    <p className='user-message'>{getUserTypeMessage()}</p> {/*User message is displayed here*/}
    <button onClick={() => setCurrentPage('settings')} className='settings-button'>Settings</button>
    <p className='stocktable-title'>Top Stocks Purchased by Institutional Investors in the Last 6 Months</p>
      <table>
        <thead>
          <tr>
            <th>ID {renderSortIcons('id')}</th>
            <th>Symbol {renderSortIcons('symbol')}</th>
            <th>Stock {renderSortIcons('stock')}</th>
            <th>Percent of Portfolio{renderSortIcons('percent_portfolio')}</th>
            <th>Buys{renderSortIcons('buys')}</th>
            <th>Hold Price{renderSortIcons('hold_price')}</th>
            <th>Current Price{renderSortIcons('current_price')}</th>
            <th>52 Week Low{renderSortIcons('fifty_two_week_low')}</th>
            <th>Percent Above 52 Week Low{renderSortIcons('percent_above_fifty_two_week_low')}</th>
            <th>52 Week High{renderSortIcons('fifty_two_week_high')}</th>
            {userRole === 4 && ( <th>% Difference Hold Price{renderSortIcons('calculatePercentageDifference')}</th> )}
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td>{stock.id}</td>
              <td>{stock.symbol}</td>
              <td>{stock.stock}</td>
              <td>{stock.percent_portfolio}</td>
              <td>{stock.buys}</td>
              <td>{stock.hold_price ? stock.hold_price : 'N/A'}</td>
              <td>{stock.current_price}</td>
              <td>{stock.fifty_two_week_low}</td>
              <td>{stock.percent_above_fifty_two_week_low}</td>
              <td>{stock.fifty_two_week_high}</td>
              {/* Calculate the percentage difference for paid users */}
              {userRole === 4 && ( <td>{calculatePercentageDifference(stock.hold_price, stock.current_price)}</td> )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StocksTable;