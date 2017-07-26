const hitsPerPage=15;
		
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getTotPages(totHits,hPerPage=hitsPerPage){
	return Math.ceil(totHits/hPerPage);
}

function getCurrentPage(offset,hPerPage=hitsPerPage){
	return Math.ceil(offset/hPerPage);
}

function resetPagination(){
	$("[id=p1]").addClass("hidden").removeClass("active");
	$("[id=p2]").addClass("hidden").removeClass("active");
	$("[id=p3]").addClass("hidden").removeClass("active");
	$("[id=p1]").prop('onclick',null).off('click');
	$("[id=p2]").prop('onclick',null).off('click');
	$("[id=p3]").prop('onclick',null).off('click');
	$("[id=pprev]").prop('onclick',null).off('click');
	$("[id=pnext]").prop('onclick',null).off('click');
	$("[id=pnext]").removeClass("disabled");
	$("[id=pprev]").removeClass("disabled");
	$(".pages").addClass("hidden");
	$(".searchinfo").addClass("hidden");
}

function createPagination(currPage,totPages,offset){
	var obj={"pages":[]}
	resetPagination();
	var query=$("#query").val();

	var maxPagTabs=0;
	if(totPages==0){
		maxPagTabs=0;
	} else {
		$(".pages").removeClass("hidden");
		$(".searchinfo").removeClass("hidden");
		if(totPages>=3){
			maxPagTabs=3;
		} else if (totPages==2){
			maxPagTabs=2;
		} else if (totPages==1){
			maxPagTabs=1;
		}
	}

	var t;
	var a;
	if(currPage<=1){
		t=1;
		a=t;
	} else if (currPage==totPages){
		if(totPages>=3){
			t=currPage-2;
			a=3;
		} else if(totPages==2){
			t=currPage-1
			a=2;
		} else {
			t=currPage;
			a=1;
		}
	} else {
		t=currPage-1;
		a=2
	}
	var p=obj.pages;
	var idx=0;
	for(var i=0;i<maxPagTabs;i++){
		idx=i+1;
		p[i]={};
		p[i]["id"]="p"+idx;
		p[i]["text"]=t;
		p[i]["offset"]=(t-1)*hitsPerPage;
		if(idx==a){p[i]["active"]=true;} else {p[i]["active"]=false;}
		t++;
	}

	$("[id=pprev]").click({query: query, offset: (currPage-2)*hitsPerPage},searchOffset);
	$("[id=pnext]").click({query: query, offset: (currPage)*hitsPerPage},searchOffset);

	var id;
	for(var i=0;i<p.length;i++){
		var page=p[i];
		id=$("[id="+page.id+"]");
		id.removeClass("hidden");
		id.children().text(page.text);
		if(page.active) {
			id.addClass("active");
			if(i==0) {$("[id=pprev]").addClass("disabled");$("[id=pprev]").prop('onclick',null).off('click');}
			if(i==p.length-1){$("[id=pnext]").addClass("disabled");$("[id=pnext]").prop('onclick',null).off('click');}
		} else {
			var off=page.offset;
			id.click({query: query, offset: off},searchOffset);
		}
	}
}

function getResults(data){
	$("#results").remove();
	$(".hitsInfo").empty();
	console.log(JSON.stringify(data));
	var totalhits=data.query.searchinfo.totalhits;
	var totalPages=getTotPages(totalhits,hitsPerPage);

	var query=$("#query").val();

	var offset=hitsPerPage;
	if(totalPages>=1) {
		var page=1;

		if(data.hasOwnProperty("continue")){
			offset=data.continue.sroffset;
			page=getCurrentPage(offset,hitsPerPage);
		} else if(totalhits>hitsPerPage){
			var page=totalPages;
		}
		$(".hitsInfo").append("Showing page "+numberWithCommas(page)+" of " + numberWithCommas(totalPages)) + " pages";
		createPagination(page,totalPages,offset);
	} else {
		createPagination(0,totalPages,offset);
		$(".hitsInfo").append("Showing page 0 if 0 pages");
	}

	// show search info and pagination
	// $(".searchinfo").css('display','flex');
	// $(".pagesBot").css('display','flex');


	// get results
	var results=data.query.search;
	$(".wrapper").append("<ul id='results' class='resultsList'>");
	for (var i=0;i<results.length;i++){
		$("#results").append("<li class='hit' id='hit"+i+"''>")
		$("#hit"+i).append("<a href='http://en.wikipedia.org/wiki/"+results[i].title+"' target='_blank' class='hitLink unstyledLink' id='hitLinkID" +i+"'>")
		var hID=$("#hitLinkID"+i);
		hID.append("<h4><strong>"+results[i].title+"</strong></h4>");
		hID.append(""+results[i].snippet+"");
	}
}

function searchOffset(event){
	var query=event.data.query;
	var offset=event.data.offset;
	$.getJSON("https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&&srlimit="+hitsPerPage+"&sroffset="+offset+"&srsearch="+query+"&callback=?",getResults);

}


function search(query){
	$.getJSON("https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&&srlimit="+hitsPerPage+"&sroffset=0&srsearch="+query+"&callback=?",getResults);
}

$(document).ready(function(){
	$(".searchForm").on("submit",function(){
		$(".searchinfo").addClass("hidden");
		$(".pages").addClass("hidden");
		search($("#query").val());
		return false;

	});
});