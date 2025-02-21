import React, { useState, useEffect } from "react";
import "./App.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "https://expense-backend-warc.onrender.com";

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const [email, setEmail] = useState("");
  const [expenseLimit, setExpenseLimit] = useState("");

  const [loading, setLoading] = useState(true)

  const expenseData = localStorage.getItem("expense");
  const Expensedata = expenseData ? JSON.parse(expenseData) : []; 

  

  useEffect(() => {
    if (loading) {

      fetch(`${API_URL}/expenses`)
        .then((res) => res.json())
        .then((data) => {
          setExpenses(data)
          
        })
        .catch((error) => console.error("Error fetching expenses:", error));
  

      fetch(`${API_URL}/set-expense-limit`)
        .then((res) => res.json())
        .then((data) => {
          setExpenseLimit(data.expenseLimit);
        
          localStorage.setItem("expense", JSON.stringify(data)); 
        })
        .catch((error) => console.error("Error fetching expense limit:", error));
  
      setLoading(false);
    }
  }, [loading]);
  


  const validateForm = () => {
    let newErrors = {};
    if (!amount || amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e, setter, field) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
    }
  };

  const addExpense = async () => {
    if (!validateForm()) return;

    const expenseData = { amount, description, category, date, paymentMethod };
    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData),
    });

    if (response.ok) {
      const newExpense = await response.json();
      setExpenses([...expenses, newExpense]);
      resetForm();
    }
  };

  const deleteExpense = async (id) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setExpenses(expenses.filter((exp) => exp._id !== id));
    }
  };

  const startEditing = (expense) => {
    setEditingId(expense._id);
    setAmount(expense.amount);
    setDescription(expense.description);
    setCategory(expense.category);
    setDate(expense.date);
    setPaymentMethod(expense.paymentMethod);
    setErrors({});
  };

  const updateExpense = async () => {
    if (!validateForm()) return;

    const updatedExpense = { amount, description, category, date, paymentMethod };
    const response = await fetch(`${API_URL}/expenses/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedExpense),
    });

    if (response.ok) {
      const updatedData = await response.json();
      setExpenses(expenses.map((exp) => (exp._id === editingId ? updatedData : exp)));
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setAmount("");
    setDescription("");
    setCategory("Food");
    setDate("");
    setPaymentMethod("Cash");
    setErrors({});
  };

  const setLimit = async () => {
    if (!email || !expenseLimit) {
        alert("Please enter email and expense limit.");
        return;
    }

    const response = await fetch(`${API_URL}/set-expense-limit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, expenseLimit }),
    });
     setLoading(true);
    if (response.ok) {
        alert("Expense limit set successfully!");
        setExpenseLimit("");
    } else {
        alert("Failed to set expense limit.");
    }
};


  return (
    <>
     {Expensedata.length===0 ? 
        <div className="account-section">
        <h3>Set Expense Limit</h3>
       <div className="form">
        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
        />
      
        <input
            type="number"
            value={expenseLimit}
            onChange={(e) => setExpenseLimit(e.target.value)}
            placeholder="Set expense limit (₹)"
        /> 
        </div>
        <button onClick={setLimit}>Set Limit</button>
      </div>
        :
        <>
      <div className="container">
        <h2>Expense Tracker</h2>
        <div className="form">
          <input
            type="number"
            value={amount}
            onChange={(e) => handleChange(e, setAmount, "amount")}
            placeholder="Amount"
          />
          {errors.amount && <p className="error">{errors.amount}</p>}

          <input
            type="text"
            value={description}
            onChange={(e) => handleChange(e, setDescription, "description")}
            placeholder="Description"
          />
          {errors.description && <p className="error">{errors.description}</p>}

          <input
            type="date"
            value={date}
            onChange={(e) => handleChange(e, setDate, "date")}
          />
          {errors.date && <p className="error">{errors.date}</p>}

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Food</option>
            <option>Transport</option>
            <option>Entertainment</option>
            <option>Utilities</option>
            <option>Shopping</option>
            <option>Rent</option>
            <option>Health</option>
            <option>Insurance</option>
            <option>Investments</option>
            <option>Education</option>
            <option>Travel</option>
            <option>Gifts</option>
            <option>Subscriptions</option>
            <option>Miscellaneous</option>
          </select>

          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option>Cash</option>
            <option>Credit Card</option>
            <option>Debit Card</option>
            <option>UPI</option>
          </select>

          {editingId ? (
            <button className="update-btn" onClick={updateExpense}>
              Update Expense
            </button>
          ) : (
            <button className="add-btn" onClick={addExpense}>
              Add Expense
            </button>
          )}
        </div>
      </div>
       
       {expenses.length!==0 &&
      <div className="table_container">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Amount (₹)</th>
              <th>Description</th>
              <th>Category</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <td>₹{exp.amount}</td>
                <td>{exp.description}</td>
                <td>{exp.category}</td>
                <td>{exp.paymentMethod}</td>
                <td>{exp.date}</td>
                <td>
                  <div className="btn">
                    <button className="edit-btn" onClick={() => startEditing(exp)}>
                      <FaEdit />
                    </button>
                    <button className="delete-btn" onClick={() => deleteExpense(exp._id)}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
}
      </>
}
    </>
  );
};

export default App;



