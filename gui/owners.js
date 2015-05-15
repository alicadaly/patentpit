function aggSuccess(id, t1, response) {

	$(id + " .status").hide()

	var stats = $(id + " .stats")
    stats.text("PATENT COUNT: " + response['count'] + " SEARCH TIME: " + response['time_search_ms'] + "ms TOTAL REQUEST TIME: " + (new Date().getTime() - t1) + "ms");
	stats.show();

    var data = $(id + " .data");
    data.empty();
    $.each(response['data'], function(idx, r) {
        var s = "<div class='agg-item'><div class='agg-value'></div><div class='agg-text'>" + r['key'].toUpperCase() + ": " + r['count'] + "</div></div>";
        data.append(s);
    });
    data.show();

    var _d = [];
    $.each(response['data'], function(idx, r) {
        _d.push(r['count']);
    });
    var _width = d3.scale.linear()
        .domain([0, d3.max(_d)])
        .range([0, 975]);

    d3.selectAll(id + " .agg-value")
        .data(_d)
        .style("width", function(d) { return _width(d) + "px"; })

    return;

}

function aggError(id, response, error) {

	$(id + " .status").hide();

	var s = "";
	if (response.responseText == undefined) {
		if (response.state() == "rejected") {
			s = "can't connect to the server";
		}
		else {
			s = "unknown request error";
		}
	}
	else {
		s = $.parseJSON(response.responseText)["error"];
	}

	$(id + " .error").text("error: " + s).show();
}


function _abortRequest(r) {
    if (r != null) {
        r.abort();
        console.log("aborted: " + r);
        r = null;
    }
}


function _buildQueryString() {
    var params = {
        "title": _clean($("#search_title").val()),
        "owner": _clean($("#search_owner").val()),
		"date_from": _clean($("#search_date_from").val()),
		"date_to": _clean($("#search_date_to").val()),
    };
    var s = _encodeParams(params);
    return s;
}


function _clean(s) {
	var r = new RegExp("[^A-Za-z0-9_\-]+", "g");
    return s
		.replace(r, " ")
        .trim()
        .split(" ")
        .join(",")
        .toLowerCase();
}


function aggProcessing(id, url) {
    $(id + " .title").show();
    $(id + " .url").text("API URL: " + url).show();
    $(id + " .stats").empty().show();
    $(id + " .status").text("processing...").show();
    $(id + " .error").empty().hide();
    $(id + " .data").empty().hide();
    $(id).show();
}


function _encodeParams(p) {
    var s = "";
    $.each(p, function(k, v) {
        s += k + "=" + v + "&";
    });
    return s.slice(0,-1)
}


function _decodeParams(s) {
    var params = {}
    $.each(s.split("&"), function(_, v) {
        kv = v.split("=");
        if (kv[0] != "") {
            params[kv[0]] = kv[1];
        }
    });
    return params
}


function process(event) {

	var t1 = new Date().getTime()


    _abortRequest(topOwnersRequest);
    _abortRequest(sigTitlesRequest);
    _abortRequest(topTitlesRequest);

    var queryString = _buildQueryString();
    document.location.hash = queryString;

	var url;

	url = BASE + "/api/topowners?" + queryString;
    aggProcessing("#top_owners", url);
	topOwnersRequest = $.ajax({
		url: url,
		type: "GET",
		dataType : "json",
		success: function(response){ aggSuccess("#top_owners", t1, response); },
		error: function(response, error){ aggError("#top_owners", response, error); },
	});

	url = BASE + "/api/sigtitles?" + queryString;
    aggProcessing("#sig_titles", url);
	sigTitlesRequest = $.ajax({
		url: url,
		type: "GET",
		dataType : "json",
		success: function(response){ aggSuccess("#sig_titles", t1, response); },
		error: function(response, error){ aggError("#sig_titles", response, error); },
	});

	url = BASE + "/api/toptitles?" + queryString;
    aggProcessing("#top_titles", url);
	topTitlesRequest = $.ajax({
		url: url,
		type: "GET",
		timeout: 100,
		dataType : "json",
		success: function(response){ aggSuccess("#top_titles", t1, response); },
		error: function(response, error){ aggError("#top_titles", response, error); },
	});

}


var BASE = "http://" + (document.domain || "localhost:8080");
var topOwnersRequest = null;
var sigTitlesRequest = null;
var topTitlesRequest = null;

$( document ).ready(function() {

	$("#top_owners").hide();
	$("#sig_titles").hide();
	$("#top_titles").hide();

    var params = _decodeParams(document.location.hash.slice(1).replace(",", " "));
    $("#search_title").val(params['title']);
    $("#search_owner").val(params['owner']);
    $("#search_date_from").val(params['date_from']);
    $("#search_date_to").val(params['date_to']);

	$("#search_form").on("keyup", process);
	$("#search_form").on("submit", process);

    if (document.location.hash != "") {
	    process();
	}

});

