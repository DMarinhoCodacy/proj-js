<?php
	$pageTitle = "Website  Management";
    include "includes/header.php";
    include "includes/left_panel.php";
    $ID=$_GET['ID'];
    $mode=$_GET['mode'];
    if($mode=="edit"){
		//$squery=mysql_query("SELECT * FROM ".tblPrefix."websites WHERE ID='$ID'");
		$squery = $dbCon->getRecord("SELECT * FROM ".tblPrefix."websites WHERE ID=?", array($ID), true);
		$ID = $squery["ID"];
        $token = stripslashes($squery["TOKEN"]);
        $webName = stripslashes($squery["NAME"]);
        $webURL = stripslashes($squery["URL"]);
        $contName = stripslashes($squery["PERSON_NAME"]);
	}
    ?>
        <aside class="right-side">                
            <section class="content-header">
                <?php if($mode!="edit"){?>
                    <button type="button" class="btn btn-sm btn-success" id="ShowLink" onClick="showHideForm('AddEditform', 'Show');"><i class="fa fa-plus-circle" aria-hidden="true"></i> Add New Website</button>
                    <button type="button" class="btn btn-sm btn-danger" id="HideLink" onClick="showHideForm('AddEditform', 'Hide');" style="display:none"><i class="fa fa-minus-circle" aria-hidden="true"></i> Hide Website Form</button>
                <?php }else{ ?>
                    <h1> Update Website <small>Details</small></h1>
                <?php } ?>
                <ol class="breadcrumb">
                    <li><a href="dashboard.php"><i class="fa fa-dashboard"></i> Dashboard</a></li><li class="active">Manage Websites Master</li>
                </ol>
            </section>
            
            <section class="content">
                <div class="row">
                    <div class="col-md-12">
                        <?php if(($_GET['msg']=="SUCCESS") || ($_GET['msg']=="UPDATED") || ($_GET['msg']=="SHIPPING_METHODS_ADDED") || ($_GET['msg']=="SHIPPING_METHODS_UPDATED")){ ?>
                        <div class="alert alert-success alert-dismissable">
                            <i class="fa fa-check"></i> <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                            <?php
									?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <?php } ?>
                        
                    </div>
                </div>
            </section>
        </aside>
<?php
include "includes/footer.php";
?>