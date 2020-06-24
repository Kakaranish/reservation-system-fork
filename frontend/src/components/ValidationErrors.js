import React from 'react';

const ValidationErrors = ({ errors }) => {
	if (!errors?.length) return <></>

	return <div className="col-12 mt-2">
		<h4 className="text-danger">Validation errors</h4>
		<ul>
			{
				errors.map((error, i) =>
					<li key={`val-err-${i}`} className="text-danger font-weight-bold">
						{error}
					</li>
				)
			}
		</ul>
	</div>
};

export default ValidationErrors;