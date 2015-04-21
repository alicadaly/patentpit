function updateAgg(id, t1, response) {

    $(id + " .stats").text("PATENT COUNT: " + response['count'] + " SEARCH TIME: " + response['time_search_ms'] + "ms TOTAL REQUEST TIME: " + (new Date().getTime() - t1) + "ms");
    $(id + " .title").show()

    var data = $(id + " .data");
    data.empty();

    $.each(response['data'], function(idx, r) {
        var s = "<div class='agg-item'><div class='agg-value'></div><div class='agg-text'>" + r['key'] + ": " + r['doc_count'] + "</div></div>";
//         data.append(_highlight(s));
        data.append(s);
    });

    var _d = [];
    $.each(response['data'], function(idx, r) {
        _d.push(r['doc_count']);
    });
    var _width = d3.scale.linear()
        .domain([0, d3.max(_d)])
        .range([0, 985]);

    console.log(_d);

    d3.selectAll(id + " .agg-value")
        .data(_d)
        .style("width", function(d) { return _width(d) + "px"; })

    return;

}

function _abortRequest(r) {
    if (r != null) {
        r.abort();
        r = null;
        console.log("aborted: " + r);
    }
}

function _getQueryString() {
    var params = {
        "title": _clean($("#search_title").val()),
        "owners": _clean($("#search_owners").val()),
        "dates": _clean($("#search_dates").val()),
    };
    var s = _encode(params);
    return s;
}

function _updateAgg(id, url) {
    $(id + " .url").text("API URL: " + url);
    $(id + " .stats").text("processing...");
    $(id + " .data").empty();
}

function _resetAgg(id) {
    $(id + " .title").hide();
    $(id + " .url").empty();
    $(id + " .stats").empty();
    $(id + " .data").empty();
}

function process(event) {

	var t1 = new Date().getTime()

	function updateOwners(response) {
        ownersRequest = null;
        updateAgg("#owners", t1, response);
	}

	function updateSigterms(response) {
        sigtermsRequest = null;
        updateAgg("#sigterms", t1, response);
	}

	function updateTopterms(response) {
        toptermsRequest = null;
        updateAgg("#topterms", t1, response);
	}

    _abortRequest(ownersRequest);
    _abortRequest(sigtermsRequest);
    _abortRequest(toptermsRequest);

    var queryString = _getQueryString();
    document.location.hash = queryString;

    _updateAgg("#owners", BASE + "/api/owners?" + queryString);
	ownersRequest = $.ajax({
		url: BASE + "/api/owners?" + queryString,
		type: "GET",
		dataType : "json",
		success: updateOwners,
		error: function (response) {
// 			console.log(response.statusText);
            _resetAgg("#owners");
		}
	});

    _updateAgg("#sigterms", BASE + "/api/sigterms?" + queryString);
	sigtermsRequest = $.ajax({
		url: BASE + "/api/sigterms?" + queryString,
		type: "GET",
		dataType : "json",
		success: updateSigterms,
		error: function (response) {
// 			console.log(response.statusText);
            _resetAgg("#sigterms");
		}
	});

    _updateAgg("#topterms", BASE + "/api/topterms?" + queryString);
	toptermsRequest = $.ajax({
		url: BASE + "/api/topterms?" + queryString,
		type: "GET",
		dataType : "json",
		success: updateTopterms,
		error: function (response) {
// 			console.log(response.statusText);
            _resetAgg("#topterms");
		}
	});

}


SPACES = new RegExp("[^A-Za-z0-9_\-]+", "g");
function _clean(s) {
    s = s
        .replace(SPACES, " ")
        .trim()
        .split(" ")
        .join(",")
        .toLowerCase();
    return s;
}

function _encode(p) {
    var s = "";
    $.each(p, function(k, v) {
        s += k + "=" + v + "&";
    });
    return s.slice(0,-1)
}

function _decode(s) {
    var params = {}
    $.each(s.split("&"), function(_, v) {
        kv = v.split("=");
        if (kv[0] != "") {
            params[kv[0]] = kv[1];
        }
    });
    return params
}


var BASE = "http://" + (document.domain || "localhost:8080");
var ownersRequest = null;
var sigtermsRequest = null;
var toptermsRequest = null;

$( document ).ready(function() {

    var params = _decode(document.location.hash.slice(1).replace(",", " "));
    $("#search_title").val(params['title'])
    $("#search_owners").val(params['owners'])
    $("#search_dates").val(params['dates'])

	$("#searchform").on("keyup", process);
	$("#searchform").on("submit", process);

    if (document.location.hash != "") {
	    process();
	}

});

