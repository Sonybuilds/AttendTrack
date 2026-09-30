import { DataGrid, GridColumnMenuContainer, GridColumnMenuHideItem, } from "@mui/x-data-grid";
import { MdEdit, MdDelete } from "react-icons/md";
import { useEffect, useState } from 'react';
import { Autocomplete, Button, TextField, } from '@mui/material';

const CustomColumnMenu = (props) => {
	const { hideMenu, colDef } = props;
	return (
		<GridColumnMenuContainer hideMenu={hideMenu} colDef={colDef}>
			<GridColumnMenuHideItem colDef={colDef} onClick={hideMenu} />	</GridColumnMenuContainer>
	);
};

export default function StudentTable() {
	const [students, setStudents] = useState([]);
	const [totalStudents, setTotalStudents] = useState(0);
	const [loading, setLoading] = useState(false);
	const [selectedRow, setSelectedRow] = useState({ type: "include", ids: new Set() });
	const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10, });

	const getStudents = async () => {
		try {
			setLoading(true);
			/*
					Later replace this with your API:
	
					const response = await fetch(
							`/api/students?page=${page}&limit=${limit}`
					);
	
					const data = await response.json();
	
					setStudents(data.students);
					setTotalStudents(data.total);
			*/

			// -----------------------------------------
			// TEMPORARY DATA FOR TESTING
			// -----------------------------------------

			const startIndex =
				paginationModel.page * paginationModel.pageSize;

			const endIndex =
				startIndex + paginationModel.pageSize;

			// You can remove this when API is ready
			const { default: studentArray } =
				await import('../data/student_data');
			const pageData =
				studentArray.slice(startIndex, endIndex);
			setStudents(pageData);
			setTotalStudents(studentArray.length);

		} catch (error) {

			console.error("Error getting students:", error);

		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		async function student() { await getStudents(); }
		student()
	}, [paginationModel]);

	const handleDelete = (student) => { console.log("Delete Student:", student); };
	const handleEdit = (student) => {	console.log("Edit Student:", student); };

	const columns = [
		{
			field: "serialNo", headerName: "S.No.", width: 80, sortable: false,	disableColumnMenu: true,
			renderCell: (params) => { const rowIndex = 	students.findIndex((student) =>	student.rollNo === params.row.rollNo);
				return (paginationModel.page * paginationModel.pageSize + rowIndex + 1);
			},
		},
		{ field: 'name', headerName: 'Name', width: 220, flex: 1, disableColumnMenu: 'true' },
		{ field: 'fatherName', headerName: 'Father Name', width: 220, flex: 1, disableColumnMenu: 'true', sortable: 'false' },
		{ field: 'rollNo', headerName: 'Roll No', width: 130, flex: 0.7, disableColumnMenu: 'true', },
		{ field: 'phone', headerName: 'Phone', width: 150, flex: 0.8, sortable: 'false' },
		//   { field: 'email', headerName: 'Email', width: 200 },
		{ field: 'className', headerName: 'Class', width: 100, flex: 0.5, disableColumnMenu: 'true' },
		{ field: 'departmentName', headerName: 'Department', width: 200, flex: 1 },
		{ field: "actionButton",	headerName: "Action",	width: 90,	sortable: false, disableColumnMenu: true,
			renderCell: (params) => (
				<div className="h-full flex items-center justify-center gap-1">

					<Button className="!min-w-0 !w-7 !p-1" variant="text" color="success" onClick={() => handleEdit(params.row)}>
						<MdEdit className="text-lg" /> </Button>

					<Button className="!min-w-0 !w-7 !p-1" variant="text" color="error" onClick={() => handleDelete(params.row)}>
						<MdDelete className="text-lg" /> </Button>
				</div>),
		},
	]

	return (
		<>
			{/* Search Filter */}
			<div className="mt-5 !px-10">
				<div className="flex gap-3 items-center w-full">

					<TextField id="student-search" placeholder="Search by Student Name & Student Code" variant="standard" className="w-full"
						sx={{
							'& .MuiInputBase-input': {	fontSize: '1rem', color: '#111827', paddingLeft: '5px !important',
							'&::placeholder': { color: '#6b7280', opacity: 1, },	},
						}} />

					<Autocomplete options={[]} autoHighlight autoSelect clearOnBlur={false} openOnFocus className="!w-90 "
						renderInput={(params) => (<TextField {...params} placeholder="Search class Name..." variant="standard"
							sx={{
								'& .MuiInputBase-input': {
									fontSize: '1rem', color: '#111827', paddingLeft: '5px !important',
									'&::placeholder': { color: '#6b7280', opacity: 1, },
								},
							}} />
						)} />

					<Autocomplete options={[]} autoHighlight autoSelect clearOnBlur={false} openOnFocus className="!w-90"
						renderInput={(params) => (
							<TextField  {...params} placeholder="Search Department Name..." variant="standard"
								sx={{
									'& .MuiInputBase-input': {	fontSize: '1rem', color: '#111827', paddingLeft: '5px !important',
									'&::placeholder': { color: '#6b7280', opacity: 1, },	},
								}}
							/>)} />
				</div>
			</div>

			{/* DataGrid */}
			<div className="p-8">
				<DataGrid
					rows={students}
					columns={columns}
					getRowId={(row) => row.rollNo}
					checkboxSelection
					disableRowSelectionOnClick
					pagination
					paginationMode="server"
					rowCount={totalStudents}
					paginationModel={paginationModel}
					onPaginationModelChange={setPaginationModel}
					pageSizeOptions={[10, 25, 50,]}
					loading={loading}
					slots={{ columnMenu: CustomColumnMenu,	}}
					autoHeight
					disableRowSelectionExcludeModel
					rowSelectionModel={selectedRow}
					onRowSelectionModelChange={(newSelection) => {
						setSelectedRow(newSelection);
					}}

					sx={{
						width: '100%',
						"& .MuiDataGrid-cell:focus": { outline: "none", },
						"& .MuiDataGrid-cell:focus-within": { outline: "none", },
						"& .MuiDataGrid-columnHeader:focus": { outline: "none", },
						"& .MuiDataGrid-columnHeader:focus-within": { outline: "none", },
						"& .MuiDataGrid-footerContainer": { minHeight: "52px", },
					}}
				/>

				{selectedRow.ids.size > 0 &&
					<div>	<Button onClick={() => { console.log(selectedRow) }}>	Show	</Button>	</div>
				}
			</div>
		</>
	)
}