import { CourseReview } from '../typings/course.types';

export interface EmptyCourseFormData {
	isEmpty: boolean;
	uuid: string;
}

export const isEmptyCourseFormData = (
	value: CourseReview | EmptyCourseFormData
): value is EmptyCourseFormData => {
	return 'isEmpty' in value && value.isEmpty === true;
};

export const getEmptyCourseFormData = (uuid: string): EmptyCourseFormData => {
	return {
		isEmpty: true,
		uuid,
	};
};

export const AppName = 'NovaLearn';

export const chartsColorsPallete = [
	'#AD7AFF',
	'#9D3AC7',
	'#395AFF',
	'#FF59F1',
	'#23C8FF',
	'#00DA86',
	'#FFEE37',
	'#F0257D',
]

export const chartsColorsPalleteBright = chartsColorsPallete.map(color => shadeColor(color, 60))
export const chartsColorsPalleteDark = chartsColorsPallete.map(color => shadeColor(color, -20))

function shadeColor(color: string, percent: number) {

	let R = parseInt(color.substring(1,3),16);
	let G = parseInt(color.substring(3,5),16);
	let B = parseInt(color.substring(5,7),16);

    R = parseInt((R * (100 + percent) / 100).toString());
    G = parseInt((G * (100 + percent) / 100).toString());
    B = parseInt((B * (100 + percent) / 100).toString());

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    R = Math.round(R)
    G = Math.round(G)
    B = Math.round(B)

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}