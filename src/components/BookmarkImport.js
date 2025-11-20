import React, { useState, useCallback, useContext } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { apiUrl } from '../config';
import BookmarksContext from '../context';
import { parseBookmarkFile, detectDuplicates, cleanBookmarks } from '../utils/bookmarkParser';
import * as style from './Breakpoints';

const StyledImport = styled.div`
	padding: 2rem;
	background-color: #f0f0f0;
	border-radius: 8px;
	margin: 1rem 0;
	@media (max-width: ${style.breakpoint.tablet}) {
		padding: 1rem;
	}

	h3 {
		margin-top: 0;
		color: #343436;
	}

	.drop-zone {
		border: 3px dashed #343436;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		background-color: white;
		cursor: pointer;
		transition: all 0.3s ease;

		&:hover {
			border-color: #005995;
			background-color: #f9f9f9;
		}

		&.drag-over {
			border-color: #005995;
			background-color: #e3f2fd;
		}

		@media (max-width: ${style.breakpoint.tablet}) {
			padding: 1rem;
		}
	}

	.file-info {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #e3f2fd;
		border-radius: 5px;
	}

	.import-stats {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #e8f5e9;
		border-radius: 5px;
	}

	.error {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #ffebee;
		border-radius: 5px;
		color: #c62828;
	}

	button {
		background: #343436;
		color: white;
		border: none;
		border-radius: 5px;
		padding: 0.75rem 1.5rem;
		font-size: 1.25rem;
		cursor: pointer;
		margin-top: 1rem;
		margin-right: 0.5rem;

		&:hover {
			background: #005995;
		}

		&:disabled {
			background: #ccc;
			cursor: not-allowed;
		}

		@media (max-width: ${style.breakpoint.tablet}) {
			width: 100%;
			margin-right: 0;
			margin-top: 0.5rem;
		}
	}

	input[type="file"] {
		display: none;
	}
`;

export default function BookmarkImport() {
	const { state, dispatch } = useContext(BookmarksContext);
	const [dragOver, setDragOver] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [parsedBookmarks, setParsedBookmarks] = useState(null);
	const [duplicateInfo, setDuplicateInfo] = useState(null);
	const [importing, setImporting] = useState(false);
	const [importResult, setImportResult] = useState(null);
	const [error, setError] = useState(null);
	const fileInputRef = React.useRef(null);

	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		setDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		setDragOver(false);
	}, []);

	const processFile = useCallback(async (file) => {
		setError(null);
		setImportResult(null);

		if (!file) return;

		// Check file type
		if (!file.name.endsWith('.html') && !file.name.endsWith('.json')) {
			setError('Please upload a valid bookmark file (.html or .json)');
			return;
		}

		try {
			const content = await file.text();
			const parsed = parseBookmarkFile(content);
			const cleaned = cleanBookmarks(parsed);

			if (cleaned.length === 0) {
				setError('No valid bookmarks found in file');
				return;
			}

			// Detect duplicates
			const dupInfo = detectDuplicates(cleaned, state.bookmarks);

			setParsedBookmarks(cleaned);
			setDuplicateInfo(dupInfo);
			setSelectedFile(file);
		} catch (err) {
			console.error('Error processing file:', err);
			setError('Failed to parse bookmark file. Please check the format.');
		}
	}, [state.bookmarks]);

	const handleDrop = useCallback((e) => {
		e.preventDefault();
		setDragOver(false);

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			processFile(files[0]);
		}
	}, [processFile]);

	const handleFileSelect = useCallback((e) => {
		const files = e.target.files;
		if (files.length > 0) {
			processFile(files[0]);
		}
	}, [processFile]);

	const handleImport = useCallback(async (skipDuplicates = true) => {
		if (!parsedBookmarks) return;

		setImporting(true);
		setError(null);
		setImportResult(null);

		try {
			const bookmarksToImport = skipDuplicates ? duplicateInfo.unique : parsedBookmarks;

			const res = await axios.post(`${apiUrl}/import`, {
				bookmarks: bookmarksToImport,
				skipDuplicates
			});

			setImportResult(res.data);

			// Refresh bookmarks list
			const bookmarksRes = await axios.get(`${apiUrl}/bookmarks`);
			dispatch({ type: 'GET_BOOKMARKS', payload: bookmarksRes.data });

			// Clear file selection after successful import
			setParsedBookmarks(null);
			setSelectedFile(null);
			setDuplicateInfo(null);
		} catch (err) {
			console.error('Import error:', err);
			setError('Failed to import bookmarks. Please try again.');
		} finally {
			setImporting(false);
		}
	}, [parsedBookmarks, duplicateInfo, dispatch]);

	return (
		<StyledImport>
			<h3>📥 Import Bookmarks</h3>
			<p>Import bookmarks from Chrome, Firefox, or Safari</p>

			<div
				className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
			>
				<p style={{ fontSize: '3rem', margin: '0.5rem 0' }}>📁</p>
				<p style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>
					Drag & drop bookmark file here
				</p>
				<p style={{ fontSize: '1rem', color: '#666' }}>
					or click to browse
				</p>
				<p style={{ fontSize: '0.9rem', color: '#999' }}>
					Supports HTML and JSON bookmark exports
				</p>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".html,.json"
				onChange={handleFileSelect}
			/>

			{selectedFile && parsedBookmarks && (
				<div className="file-info">
					<h4>📄 {selectedFile.name}</h4>
					<p>Found {parsedBookmarks.length} bookmark{parsedBookmarks.length !== 1 ? 's' : ''}</p>
					{duplicateInfo && (
						<>
							<p>✅ {duplicateInfo.unique.length} new</p>
							<p>⚠️ {duplicateInfo.duplicates.length} duplicate{duplicateInfo.duplicates.length !== 1 ? 's' : ''} (will be skipped)</p>
						</>
					)}
					<button onClick={() => handleImport(true)} disabled={importing}>
						{importing ? 'Importing...' : `Import ${duplicateInfo.unique.length} New Bookmark${duplicateInfo.unique.length !== 1 ? 's' : ''}`}
					</button>
					<button onClick={() => handleImport(false)} disabled={importing}>
						Import All (Including Duplicates)
					</button>
					<button onClick={() => {
						setParsedBookmarks(null);
						setSelectedFile(null);
						setDuplicateInfo(null);
					}} disabled={importing}>
						Cancel
					</button>
				</div>
			)}

			{importResult && (
				<div className="import-stats">
					<h4>✅ Import Complete!</h4>
					<p>{importResult.message}</p>
					<ul>
						<li>✅ Imported: {importResult.inserted}</li>
						<li>⏭️ Skipped: {importResult.skipped}</li>
						{importResult.errors > 0 && <li>❌ Errors: {importResult.errors}</li>}
					</ul>
				</div>
			)}

			{error && (
				<div className="error">
					<strong>Error:</strong> {error}
				</div>
			)}
		</StyledImport>
	);
}
