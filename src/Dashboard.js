import React, { Component } from "react";
import Axios from "axios";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Logout from "./Logout";
import ExcelDownloadComponent from "./Download";
import * as xlsx from "xlsx";
import { saveAs } from "file-saver";

const Dashboard = () => {
  const [bookList, setBookList] = useState([]);
  const [products, setProducts] = useState(bookList);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [uploadedData, setUploadedData] = useState();
  const [fileName, setFileName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedAuthor, setUpdatedAuthor] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [pageCount, setPageCount] = useState();
  const [searchVal, setSearchVal] = useState("");
  const [searchValPaginated, setSearchValPaginated] = useState("");
  const [department, setDepartment] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fullList, setfullList] = useState("");

  Axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const fetchBookList = async (page, limit) => {
    await Axios.get(
      `http://localhost:3001/collection?page=${page}&limit=${limit}`
    )
      .then((response) => {
        setBookList(response.data.resultCollection);
        setProducts(response.data.resultCollection);
        if (response.data.pageCount) {
          setPageCount(response.data.pageCount);
        }
      })
      .catch((error) => {
        console.error("Error fetching collection:", error);
      });
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/collection").then((res) => {
      setBookList(res.data.resultCollection);
      setProducts(res.data.resultCollection);
      setfullList(res.data.resultCollection);
      if (res.data.pageCount) {
        setPageCount(res.data.pageCount);
      }
    });
  }, []);
  const addToList = (event) => {
    event.preventDefault();
    Axios.post("http://localhost:3001/collection", {
      author: author,
      title: title,
      department: department,
    })
      .then((response) => {
        console.log(response.data);
        fetchBookList(); // Refresh the book list after adding a new one
      })
      .catch((error) => {
        console.error("Error adding to collection:", error);
      });
  };

  const updateBookList = (id, event) => {
    event.preventDefault();
    Axios.put(`http://localhost:3001/collection/${id}`, {
      title: updatedTitle,
      author: updatedAuthor,
    })
      .then((response) => {
        console.log(response.data);
        fetchBookList(); // Refresh the book list after updating
        togglePopup(); // Close the popup after successful update
      })
      .catch((error) => {
        console.error("Error updating collection:", error);
      });
  };

  // Toggle popup function
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const deleteBookList = (id) => {
    Axios.delete(`http://localhost:3001/collection/${id}`)
      .then((response) => {
        console.log(response.data);
        fetchBookList(); // Refresh the book list after deleting
      })
      .catch((error) => {
        console.error("Error deleting from collection:", error);
      });
  };

  const readUploadFile = (e) => {
    e.preventDefault();
    try {
      if (e.target.files) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = event.target.result;
          const workbook = xlsx.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = xlsx.utils.sheet_to_json(worksheet);
          setUploadedData(json);
        };
        reader.readAsArrayBuffer(e.target.files[0]);
        const file = e.target.files[0];
        setFileName(file.name);
      }
    } catch (e) {
      console.log({ msg: e });
    }
  };

  const addToData = async (event) => {
    event.preventDefault();
    console.log("Adding to list with token: ", localStorage.getItem("token"));
    const uploadPromises = uploadedData.map((item) =>
      Axios.post("http://localhost:3001/collection", {
        author: item.author,
        title: item.title,
      })
    );

    try {
      const responses = await Promise.all(uploadPromises);
      console.log("Responses:", responses);
      // Additional logic or state updates can be added here
      setShowModal(false);
      setFileName("");
      setUploadedData([]);
      fetchBookList();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const $ = window.jQuery;

  function togglePopupAdd() {
    $("#addModal").modal("toggle");
  }

  const handleNext = () => {
    if (page < pageCount) {
      setPage((prevPage) => {
        const newPage = prevPage + 1;
        fetchBookList(newPage, limit);
        return newPage;
      });
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prevPage) => {
        const newPage = Math.max(prevPage - 1, 1);
        fetchBookList(newPage, limit);
        return newPage;
      });
    }
  };

  const handleSelectChange = (e) => {
    const newLimit = e.target.value;
    setLimit(newLimit);
    setPage(1); // Reset page to 1 when limit changes
    fetchBookList(1, newLimit); // Fetch the first page with the new limit
  };

  async function handleClearSearch() {
    setStartDate("");
    setEndDate("");
    setFilterDepartment("");
    setLimit(5);
    setPage(1);

    fetchBookList();
  }

  async function handleSearchClick() {
    if (!filterDepartment && !startDate && !endDate) {
      setProducts(fullList);
      return;
    }

    const filterBySearch = fullList.filter((book) => {
      const matchesDepartment = filterDepartment
        ? book.department.toLowerCase() === filterDepartment.toLowerCase()
        : true;

      // Convert the book.create_at to a Date object
      const bookCreatedAt = new Date(book.created_at);
      // Adjust the created date to Indian Standard Time (IST)
      const adjustedBookCreatedAt = new Date(
        bookCreatedAt.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      // Compare the created date with startDate and endDate
      const matchesStartDate = startDate
        ? adjustedBookCreatedAt >= new Date(startDate)
        : true;
      const matchesEndDate = endDate
        ? adjustedBookCreatedAt <= new Date(endDate)
        : true;

      return matchesDepartment && matchesStartDate && matchesEndDate;
    });

    setProducts(filterBySearch);
  }

  const handleFilteredDownloadExcel = () => {
    if (products.length === 0) {
      console.error("No data to export");
      return;
    }

    // Filter data to include only title and author
    const filteredData = products.map(({ title, author, department }) => ({
      title,
      author,
      department,
    }));

    // Create a new workbook
    const wb = xlsx.utils.book_new();

    // Convert filtered data to worksheet
    const ws = xlsx.utils.json_to_sheet(filteredData);

    // Add the worksheet to the workbook
    xlsx.utils.book_append_sheet(wb, ws, "Sheet1");

    // Generate the XLSX file
    const wbout = xlsx.write(wb, { bookType: "xlsx", type: "array" });

    // Save the file using FileSaver.js
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "filtered-data.xlsx"
    );
  };

  async function handleSearchClickPaginated() {
    if (searchValPaginated === "") {
      setProducts(bookList);
      return;
    }

    const filterBySearch = bookList.filter((book) => {
      return (
        book.title.toLowerCase().includes(searchValPaginated.toLowerCase()) ||
        book.author.toLowerCase().includes(searchValPaginated.toLowerCase())
      );
    });

    setProducts(filterBySearch);
  }

  const deleteSelectedRows = () => {
    const checkboxes = document.querySelectorAll(".delete-checkbox");
    const ids = Array.from(checkboxes)
      .filter((cb) => cb.checked) // Changed to filter only checked checkboxes
      .map((cb) => cb.getAttribute("data-id"));

    if (ids.length === 0) {
      alert("No rows selected"); // Added alert for no rows selected
      return; // Stop further execution
    }

    console.log("IDs to delete:", ids);

    Axios.delete("http://localhost:3001/multiDeleteCollection", {
      data: { ids: ids },
    })
      .then((response) => {
        console.log("Response:", response);
        fetchBookList(); // Refresh the book list after deleting
      })
      .catch((error) => {
        console.error("Error deleting from collection:", error);
        alert("An error occurred while deleting rows."); // Added alert for deletion error
      });
  };

  // Function to toggle all checkboxes
  function toggleCheckboxes(checked) {
    const checkboxes = document.querySelectorAll(".delete-checkbox");
    checkboxes.forEach((cb) => (cb.checked = checked));
  }

  // Event handler for Select All checkbox
  function handleSelectAllClick() {
    const selectAllCheckbox = document.getElementById("selectAll");
    toggleCheckboxes(selectAllCheckbox.checked);
  }

  function formatToIndianTime(dateString) {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    };
    return date.toLocaleString("en-IN", options);
  }

  return (
    <div className="content-wrapper ">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row justify-content-center mb-2">
            <div className="col-auto">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active">Simple Tables</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="content py-4 px-2">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              <div className="card">
                <div>
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title mb-0">Collection Table</h3>
                    <span className="ml-auto d-flex">
                      <div>
                        <button
                          type="button"
                          className="btn btn-outline-primary rounded-circle p-0 m-2"
                          style={{ width: "32px", height: "32px" }}
                          onClick={() => setShowModal(true)}
                        >
                          +
                        </button>
                        {showModal && (
                          <div
                            className="modal"
                            tabIndex="-1"
                            role="dialog"
                            style={{
                              display: "block",
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                            }}
                          >
                            <div className="modal-dialog" role="document">
                              <div className="modal-content">
                                <div className="modal-header">
                                  <h5 className="modal-title">Upload File</h5>
                                  <button
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => setShowModal(false)}
                                  >
                                    <span aria-hidden="true">&times;</span>
                                  </button>
                                </div>
                                <div className="modal-body">
                                  <form onSubmit={addToData}>
                                    <label htmlFor="upload">
                                      {fileName || "No file chosen"}
                                    </label>
                                    <input
                                      type="file"
                                      name="upload"
                                      id="upload"
                                      onChange={readUploadFile}
                                    />
                                    <button
                                      className="btn btn-outline-primary mt-2"
                                      type="submit"
                                    >
                                      Submit
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="d-flex align-items-center">
                        <ExcelDownloadComponent />
                      </div>

                      <button
                        className="btn btn-danger mr-1 m-2"
                        id="deleteButton"
                        onClick={deleteSelectedRows}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-secondary  mt-2 mb-2 pt-0 pb-0 rounded"
                        aria-pressed="false"
                        onClick={togglePopupAdd}
                        data-toggle="modal"
                        data-target="#addModal"
                      >
                        Add
                      </button>
                    </span>
                  </div>
                  <div className="card-body pb-0">
                    <div className="advance-search mb-2">
                      <div className="d-flex align-items-center">
                        <div className="input-group">
                          <div className="d-block mx-2">
                            <p>Department</p>
                            <select
                              className="form-control "
                              style={{ width: "auto" }}
                              onChange={(e) =>
                                setFilterDepartment(e.target.value)
                              }
                            >
                              <option value={""}>All</option>
                              <option value={"crime"}>Crime</option>
                              <option value={"comic"}>Comic book</option>
                              <option value={"biography"}>Biography</option>
                              <option value={"drama"}>Drama</option>
                            </select>
                          </div>
                          <div className="d-block ">
                            <p>From</p>
                            <input
                              className="form-control"
                              type="datetime-local"
                              id="birthdaytime"
                              onChange={(e) => setStartDate(e.target.value)}
                            ></input>
                          </div>
                          <div className="d-block mx-2">
                            <p>To</p>
                            <input
                              className="form-control"
                              type="datetime-local"
                              id="birthdaytime"
                              onChange={(e) => setEndDate(e.target.value)}
                            ></input>
                          </div>
                          <div className="d-block">
                            <p>Give Product Information</p>
                            <div className="d-flex">
                              <div className="input-group-append">
                                <button
                                  className="btn btn-outline-success"
                                  type="button"
                                  onClick={handleSearchClick}
                                >
                                  Search
                                </button>
                                <button
                                  className="btn btn-outline-danger mx-2"
                                  type="button"
                                  onClick={handleClearSearch}
                                >
                                  clear
                                </button>
                                <button
                                  className="btn btn-outline-info"
                                  type="button"
                                  onClick={handleFilteredDownloadExcel}
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="divider"></div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <span>Show</span>
                        <select
                          className="form-control form-control-sm mx-2"
                          style={{ width: "auto" }}
                          onChange={handleSelectChange}
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                        </select>
                        <span>entries</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="input-group">
                          <div className="d-block">
                            <div className="d-flex">
                              <input
                                className="form-control"
                                type="search"
                                placeholder="Search"
                                aria-label="Search"
                                onChange={(e) =>
                                  setSearchValPaginated(e.target.value)
                                }
                              />
                              <div className="input-group-append">
                                <button
                                  className="btn btn-outline-success"
                                  type="button"
                                  onClick={handleSearchClickPaginated}
                                >
                                  Search
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="modal fade"
                  id="addModal"
                  tabIndex="-1"
                  role="dialog"
                  aria-labelledby="addModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id="addModalLabel">
                          Add Form
                        </h5>
                        <button
                          type="button"
                          className="close"
                          data-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <form onSubmit={addToList}>
                        <div className="modal-body">
                          <div className="form-group">
                            <label htmlFor="title" className="form-label">
                              Title:
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="title"
                              placeholder="Title..."
                              onChange={(e) => setTitle(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="author" className="form-label">
                              Author:
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="author"
                              placeholder="Author..."
                              onChange={(e) => setAuthor(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="department" className="form-label">
                              Department:
                            </label>
                            <select
                              className="form-control"
                              style={{ width: "auto" }}
                              onChange={(e) => setDepartment(e.target.value)}
                            >
                              <option value={"crime"}>Crime</option>
                              <option value={"comic"}>Comic book</option>
                              <option value={"biography"}>Biography</option>
                              <option value={"drama"}>Drama</option>
                            </select>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Submit
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            data-dismiss="modal"
                          >
                            Close
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            id="selectAll"
                            onClick={handleSelectAllClick}
                            // onBlur={deSelect}
                            name="mainChk"
                          />
                        </th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Department</th>
                        <th>Created At</th>
                        <th style={{ width: 40 }}>Functionalities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products &&
                        products.length > 0 &&
                        products.map((val, key) => (
                          <tr
                            key={key}
                            // className="bg-[#DBE2EF] border-b dark:bg-[#DBE2EF] dark:border-gray-700 "
                          >
                            <td>
                              <input
                                type="checkbox"
                                className="delete-checkbox"
                                data-id={val.id}
                                name="chk"
                              />
                            </td>
                            <td className="">
                              <h6 className="">{val.title}</h6>
                            </td>
                            <td className="">
                              <h6 className="">{val.author}</h6>
                            </td>
                            <td className="">
                              <h6 className="">{val.department}</h6>
                            </td>
                            <td className="">
                              <h6 className="">
                                {formatToIndianTime(val.created_at)}
                              </h6>
                            </td>
                            <td>
                              <div className="d-flex justify-content-between">
                                <>
                                  <button
                                    className="h6 btn btn-info m-1 custom active"
                                    onClick={togglePopup}
                                  >
                                    Update
                                  </button>
                                  {showPopup && (
                                    <div className="modal-overlay">
                                      <div
                                        className="modal-dialog"
                                        role="document"
                                        style={{ marginTop: "10%" }}
                                      >
                                        <div className="modal-content">
                                          <div className="modal-header">
                                            <h5 className="modal-title">
                                              Update Form
                                            </h5>
                                            <button
                                              type="button"
                                              className="close"
                                              aria-label="Close"
                                              onClick={togglePopup}
                                            >
                                              <span aria-hidden="true">
                                                &times;
                                              </span>
                                            </button>
                                          </div>
                                          <div className="modal-body">
                                            <form
                                              onSubmit={(event) =>
                                                updateBookList(val.id, event)
                                              }
                                            >
                                              <div className="form-group">
                                                <label
                                                  htmlFor="title"
                                                  className="form-label"
                                                >
                                                  Title:
                                                </label>
                                                <input
                                                  type="text"
                                                  className="form-control"
                                                  id="title"
                                                  placeholder="Update title..."
                                                  value={updatedTitle}
                                                  onChange={(e) =>
                                                    setUpdatedTitle(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </div>
                                              <div className="form-group">
                                                <label
                                                  htmlFor="author"
                                                  className="form-label"
                                                >
                                                  Author:
                                                </label>
                                                <input
                                                  type="text"
                                                  className="form-control"
                                                  id="author"
                                                  placeholder="Update author..."
                                                  value={updatedAuthor}
                                                  onChange={(e) =>
                                                    setUpdatedAuthor(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                              </div>
                                              <button
                                                className="btn btn-outline-primary mt-2"
                                                type="submit"
                                              >
                                                Submit
                                              </button>
                                            </form>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                                <button
                                  className="h6 btn btn-outline-dark m-1 custom"
                                  onClick={() => deleteBookList(val.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-footer clearfix d-flex justify-content-between">
                  <div className="d-flex">
                    <span className="">Showing</span>
                    <p className="mx-1">{page}</p>
                    <span>of</span>
                    <p className="mx-1">{pageCount}</p>
                    <span>pages</span>
                  </div>
                  <div className="pagination pagination-sm m-0 ml-auto float-right">
                    <button
                      className="page-link font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
                      onClick={handlePrevious}
                    >
                      «
                    </button>
                    <button className="page-link font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2">
                      {page}
                    </button>
                    <button
                      className="page-link font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
                      onClick={handleNext}
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
